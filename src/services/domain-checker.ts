// Domain availability check: RDAP primary + DNS SOA fallback
// SOA records are the most reliable DNS signal — every registered domain with DNS has one

const DNS_API = 'https://dns.google/resolve'

const RDAP_SERVERS: Record<string, string> = {
  com: 'https://rdap.verisign.com/com/v1/',
  net: 'https://rdap.verisign.com/net/v1/',
  org: 'https://rdap.publicinterestregistry.org/rdap/',
  app: 'https://pubapi.registry.google/rdap/',
  dev: 'https://pubapi.registry.google/rdap/',
  page: 'https://pubapi.registry.google/rdap/',
  ai: 'https://rdap.nic.ai/',
  io: 'https://rdap.nic.io/',
  co: 'https://rdap.nic.co/',
  cc: 'https://rdap.verisign.com/cc/v1/',
  tv: 'https://rdap.verisign.com/tv/v1/',
  xyz: 'https://rdap.centralnic.com/xyz/',
  me: 'https://rdap.centralnic.com/me/',
  info: 'https://rdap.afilias.net/rdap/info/',
  shop: 'https://rdap.centralnic.com/shop/',
  online: 'https://rdap.centralnic.com/online/',
  site: 'https://rdap.centralnic.com/site/',
  tech: 'https://rdap.centralnic.com/tech/',
  store: 'https://rdap.centralnic.com/store/',
  club: 'https://rdap.centralnic.com/club/',
  top: 'https://rdap.centralnic.com/top/',
  cloud: 'https://rdap.centralnic.com/cloud/',
  fun: 'https://rdap.centralnic.com/fun/',
}

// Track which TLD RDAP servers are reachable
const rdapWorking = new Set<string>()
const rdapFailed = new Set<string>()

export async function checkDomain(domain: string): Promise<boolean> {
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase()
  const parts = cleanDomain.split('.')
  if (parts.length < 2) return false
  const tld = parts[parts.length - 1]!

  // Tier 1: RDAP (skip if known-broken TLD)
  if (!rdapFailed.has(tld)) {
    const rdapResult = await checkRdap(cleanDomain, tld)
    if (rdapResult !== null) {
      rdapWorking.add(tld)
      return rdapResult
    }
    rdapFailed.add(tld)
  }

  // Tier 2: HTTP HEAD probe (fast, 1.5s)
  try {
    await fetch(`https://${cleanDomain}`, {
      method: 'HEAD', signal: AbortSignal.timeout(1500), redirect: 'follow'
    })
    return false // HTTP responds → registered
  } catch {}

  // Tier 3: DNS SOA → NXDOMAIN = definitely available, has records = registered
  const soa = await checkDnsRecord(cleanDomain, 'SOA')
  if (soa !== null) return soa

  // Tier 4: DNS A
  const a = await checkDnsRecord(cleanDomain, 'A')
  if (a !== null) return a

  // No records anywhere → available
  return true
}

async function checkRdap(domain: string, tld: string): Promise<boolean | null> {
  const server = RDAP_SERVERS[tld]
  if (!server) return null

  try {
    const url = server.endsWith('/') ? `${server}domain/${domain}` : `${server}/domain/${domain}`
    const resp = await fetch(url, { signal: AbortSignal.timeout(3000) })
    if (resp.status === 404) return true
    if (resp.status === 200) return false
    return null
  } catch {
    return null
  }
}

async function checkDnsRecord(domain: string, type: string): Promise<boolean | null> {
  try {
    const resp = await fetch(`${DNS_API}?name=${encodeURIComponent(domain)}&type=${type}`,
      { signal: AbortSignal.timeout(3000) }
    )
    if (!resp.ok) return null
    const data: { Answer?: unknown[]; Status?: number } = await resp.json()
    // NXDOMAIN = domain definitely doesn't exist → available
    if (data.Status === 3) return true
    // Has DNS records → registered
    if (data.Answer && data.Answer.length > 0) return false
    return null
  } catch {
    return null
  }
}
