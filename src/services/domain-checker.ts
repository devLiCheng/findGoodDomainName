// Ultra-conservative domain availability check
// Only returns "available" when RDAP explicitly confirms domain not in registry
// All other cases default to "registered" to avoid false positives

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

const rdapFailed = new Set<string>()

export async function checkDomain(domain: string): Promise<boolean> {
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase()
  const parts = cleanDomain.split('.')
  if (parts.length < 2) return false
  const tld = parts[parts.length - 1]!

  // Tier 1: RDAP - the ONLY authoritative source we trust for "available"
  if (!rdapFailed.has(tld)) {
    const result = await checkRdap(cleanDomain, tld)
    if (result === true) return true  // RDAP 404 → definitely available
    if (result === false) return false // RDAP 200 → definitely registered
    // RDAP failed → mark TLD as unreliable
    rdapFailed.add(tld)
  }

  // Tier 2: HTTP HEAD probe → responds = definitely registered
  try {
    await fetch(`https://${cleanDomain}`, {
      method: 'HEAD', signal: AbortSignal.timeout(2000), redirect: 'follow',
    })
    return false
  } catch {}

  // Tier 3: DNS SOA → has records = registered
  try {
    const resp = await fetch(`${DNS_API}?name=${encodeURIComponent(cleanDomain)}&type=SOA`,
      { signal: AbortSignal.timeout(3000) }
    )
    if (resp.ok) {
      const data: { Answer?: unknown[]; Status?: number } = await resp.json()
      if (data.Answer && data.Answer.length > 0) return false
    }
  } catch {}

  // Tier 4: DNS A → has records = registered
  try {
    const resp = await fetch(`${DNS_API}?name=${encodeURIComponent(cleanDomain)}&type=A`,
      { signal: AbortSignal.timeout(3000) }
    )
    if (resp.ok) {
      const data: { Answer?: unknown[] } = await resp.json()
      if (data.Answer && data.Answer.length > 0) return false
    }
  } catch {}

  // RDAP failed AND no DNS records → conservative: assume registered
  // We only trust RDAP 404 for "available". Without it, default to conservative.
  return false
}

async function checkRdap(domain: string, tld: string): Promise<boolean | null> {
  const server = RDAP_SERVERS[tld]
  if (!server) return null
  try {
    const url = server.endsWith('/') ? `${server}domain/${domain}` : `${server}/domain/${domain}`
    const resp = await fetch(url, { signal: AbortSignal.timeout(4000) })
    if (resp.status === 404) return true
    if (resp.status === 200) return false
    return null
  } catch {
    return null
  }
}
