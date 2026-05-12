// Multi-tier domain availability check:
// 1. RDAP (registry API, best accuracy) — 404=available, 200=registered
// 2. WHOIS (TCP port 43 fallback) — explicit not-found = available
// 3. DNS SOA + A (only positive signal: has records = registered)
// Conservative: if all methods fail, assume registered

import net from 'node:net'

interface RdapBootstrap {
  description: string
  publication: string
  services: Array<[string[], string[]]>
  version: string
}

let bootstrapPromise: Promise<Map<string, string>> | null = null
let bootstrapExpiresAt = 0
const BOOTSTRAP_CACHE_TTL = 24 * 60 * 60 * 1000

// Per-request result cache to avoid re-checking same domain
const requestCache = new Map<string, boolean>()
let cacheTimer: ReturnType<typeof setTimeout> | null = null

export function clearRequestCache() {
  requestCache.clear()
  if (cacheTimer) clearTimeout(cacheTimer)
  cacheTimer = null
}

function setRequestCache(domain: string, available: boolean) {
  requestCache.set(domain, available)
  if (!cacheTimer) {
    // Auto-clear after 5 minutes
    cacheTimer = setTimeout(() => {
      requestCache.clear()
      cacheTimer = null
    }, 5 * 60 * 1000)
  }
}

const BUILTIN_RDAP: Record<string, string> = {
  com: 'https://rdap.verisign.com/com/v1/',
  net: 'https://rdap.verisign.com/net/v1/',
  cc: 'https://rdap.verisign.com/cc/v1/',
  tv: 'https://rdap.verisign.com/tv/v1/',
  org: 'https://rdap.publicinterestregistry.org/rdap/',
  app: 'https://pubapi.registry.google/rdap/',
  dev: 'https://pubapi.registry.google/rdap/',
  page: 'https://pubapi.registry.google/rdap/',
  ai: 'https://rdap.nic.ai/',
  io: 'https://rdap.nic.io/',
  co: 'https://rdap.nic.co/',
  xyz: 'https://rdap.centralnic.com/xyz/',
  me: 'https://rdap.centralnic.com/me/',
  info: 'https://rdap.afilias.net/rdap/info/',
  shop: 'https://rdap.centralnic.com/shop/',
  online: 'https://rdap.centralnic.com/online/',
  site: 'https://rdap.centralnic.com/site/',
  tech: 'https://rdap.centralnic.com/tech/',
  store: 'https://rdap.centralnic.com/store/',
  cloud: 'https://rdap.centralnic.com/cloud/',
  fun: 'https://rdap.centralnic.com/fun/',
  blog: 'https://rdap.centralnic.com/blog/',
  club: 'https://rdap.centralnic.com/club/',
  top: 'https://rdap.centralnic.com/top/',
  pro: 'https://rdap.afilias.net/rdap/pro/',
}

const BUILTIN_WHOIS: Record<string, string> = {
  com: 'whois.verisign-grs.com',
  net: 'whois.verisign-grs.com',
  cc: 'whois.verisign-grs.com',
  tv: 'whois.verisign-grs.com',
  org: 'whois.pir.org',
  app: 'whois.nic.google',
  dev: 'whois.nic.google',
  page: 'whois.nic.google',
  ai: 'whois.nic.ai',
  io: 'whois.nic.io',
  co: 'whois.nic.co',
  me: 'whois.nic.me',
  xyz: 'whois.nic.xyz',
  info: 'whois.afilias.net',
  shop: 'whois.nic.shop',
  online: 'whois.nic.online',
  site: 'whois.nic.site',
  tech: 'whois.nic.tech',
  store: 'whois.nic.store',
  cloud: 'whois.nic.cloud',
  fun: 'whois.nic.fun',
  blog: 'whois.nic.blog',
  club: 'whois.nic.club',
  top: 'whois.nic.top',
  pro: 'whois.afilias.net',
}

let activeWhoisCount = 0
const MAX_CONCURRENT_WHOIS = 3

async function getRdapBootstrap(): Promise<Map<string, string>> {
  if (bootstrapPromise && Date.now() < bootstrapExpiresAt) {
    return bootstrapPromise
  }
  bootstrapPromise = loadBootstrap()
  return bootstrapPromise
}

async function loadBootstrap(): Promise<Map<string, string>> {
  const tldMap = new Map<string, string>()
  for (const [tld, server] of Object.entries(BUILTIN_RDAP)) {
    tldMap.set(tld, server)
  }
  try {
    const resp = await fetch('https://data.iana.org/rdap/dns.json', {
      signal: AbortSignal.timeout(10000),
    })
    if (resp.ok) {
      const data: RdapBootstrap = await resp.json()
      for (const [tlds, servers] of data.services) {
        const httpsServer = servers.find((s) => s.startsWith('https://'))
        if (httpsServer) {
          for (const tld of tlds) {
            tldMap.set(tld.toLowerCase(), httpsServer)
          }
        }
      }
      bootstrapExpiresAt = Date.now() + BOOTSTRAP_CACHE_TTL
    }
  } catch {
    // built-in servers already loaded
  }
  return tldMap
}

export async function checkDomain(domain: string): Promise<boolean> {
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase()
  const parts = cleanDomain.split('.')
  if (parts.length < 2) return false

  // Return cached result for this request batch
  const cached = requestCache.get(cleanDomain)
  if (cached !== undefined) return cached

  const tld = parts[parts.length - 1]!

  const result = await doCheck(cleanDomain, tld)
  setRequestCache(cleanDomain, result)
  return result
}

async function doCheck(domain: string, tld: string): Promise<boolean> {
  // Tier 1: RDAP (6s timeout)
  const rdapResult = await checkRdap(domain, tld)
  if (rdapResult !== null) return rdapResult

  // Tier 2: WHOIS (with concurrency limit)
  const whoisResult = await checkWhois(domain, tld)
  if (whoisResult !== null) return whoisResult

  // Tier 3: DNS SOA + A (only positive signals: has records → registered)
  // No records → null, we fall through to conservative
  const dnsResult = await checkDomainDns(domain)
  if (dnsResult !== null) return dnsResult

  // All methods failed → conservative: assume registered
  return false
}

async function checkRdap(domain: string, tld: string): Promise<boolean | null> {
  const bootstrap = await getRdapBootstrap()
  const rdapServer = bootstrap.get(tld)
  if (!rdapServer) return null

  try {
    const url = rdapServer.endsWith('/')
      ? `${rdapServer}domain/${domain}`
      : `${rdapServer}/domain/${domain}`

    const resp = await fetch(url, { signal: AbortSignal.timeout(4000) })

    if (resp.status === 404) return true
    if (resp.status === 200) return false
    return null
  } catch {
    return null
  }
}

function checkWhois(domain: string, tld: string): Promise<boolean | null> {
  const whoisServer = BUILTIN_WHOIS[tld]
  if (!whoisServer) return Promise.resolve(null)

  const waitForSlot = () => {
    if (activeWhoisCount < MAX_CONCURRENT_WHOIS) {
      activeWhoisCount++
      return Promise.resolve()
    }
    return new Promise<void>((resolve) => {
      const check = () => {
        if (activeWhoisCount < MAX_CONCURRENT_WHOIS) {
          activeWhoisCount++
          resolve()
        } else {
          setTimeout(check, 100)
        }
      }
      check()
    })
  }

  return waitForSlot().then(() => {
    return new Promise<boolean | null>((resolve) => {
      const client = new net.Socket()
      let data = ''
      let resolved = false

      const done = (result: boolean | null) => {
        if (resolved) return
        resolved = true
        activeWhoisCount--
        client.destroy()
        resolve(result)
      }

      const timer = setTimeout(() => {
        done(null)
      }, 4000)

      client.connect(43, whoisServer, () => {
        client.write(`${domain}\r\n`)
      })

      client.on('data', (chunk: Buffer) => {
        data += chunk.toString()
        const lower = data.toLowerCase()
        if (
          lower.includes('no match for') ||
          lower.includes('not found') ||
          lower.includes('domain not found') ||
          lower.includes('no data found') ||
          lower.includes('no entries found') ||
          lower.includes('status: free') ||
          lower.includes('status: available')
        ) {
          clearTimeout(timer)
          done(true)
        }
      })

      client.on('close', () => {
        if (resolved) return
        clearTimeout(timer)
        if (data.length === 0) {
          done(null)
          return
        }
        const lower = data.toLowerCase()
        if (
          lower.includes('no match for') ||
          lower.includes('not found') ||
          lower.includes('domain not found') ||
          lower.includes('no data found') ||
          lower.includes('no entries found') ||
          lower.includes('status: free') ||
          lower.includes('status: available')
        ) {
          done(true)
        } else if (
          lower.includes('domain name:') ||
          lower.includes('registrar:') ||
          lower.includes('creation date:') ||
          lower.includes('created:') ||
          lower.includes('registry domain id:')
        ) {
          done(false)
        } else {
          done(null)
        }
      })

      client.on('error', () => {
        clearTimeout(timer)
        done(null)
      })
    })
  })
}

async function checkDomainDns(domain: string): Promise<boolean | null> {
  // DNS is only authoritative in ONE direction:
  // Has records → definitely registered (return false)
  // No records → INCONCLUSIVE (return null), let caller decide

  const soaResult = await checkDnsType(domain, 'SOA')
  if (soaResult === false) return false // Has SOA → definitely registered

  const aResult = await checkDnsType(domain, 'A')
  if (aResult === false) return false // Has A → definitely registered

  return null // Inconclusive, don't guess
}

async function checkDnsType(domain: string, type: string): Promise<boolean | null> {
  try {
    const resp = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`,
      { signal: AbortSignal.timeout(3000) }
    )
    if (!resp.ok) return null
    const data: { Answer?: unknown[] } = await resp.json()
    if (data.Answer && data.Answer.length > 0) {
      return false
    }
    return null
  } catch {
    return null
  }
}
