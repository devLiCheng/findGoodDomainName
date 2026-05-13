// Fast domain availability check using DNS-over-HTTPS and HTTP probes

const DNS_API = 'https://dns.google/resolve'

export async function checkDomain(domain: string): Promise<boolean> {
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase()
  if (!cleanDomain.includes('.')) return false

  // Quick check: try HTTP HEAD (2s timeout) - if site responds, definitely registered
  try {
    const resp = await fetch(`https://${cleanDomain}`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(2000),
      redirect: 'follow',
    })
    return false // HTTP responds → registered
  } catch {
    // No response → continue checking
  }

  // DNS check: look for A, AAAA, CNAME records
  const types = ['A', 'AAAA', 'CNAME']
  for (const type of types) {
    try {
      const resp = await fetch(`${DNS_API}?name=${encodeURIComponent(cleanDomain)}&type=${type}`, {
        signal: AbortSignal.timeout(3000),
      })
      if (resp.ok) {
        const data: { Answer?: unknown[] } = await resp.json()
        if (data.Answer && data.Answer.length > 0) {
          return false // DNS records exist → registered
        }
      }
    } catch {
      // Continue to next type
    }
  }

  // Also check SOA record
  try {
    const resp = await fetch(`${DNS_API}?name=${encodeURIComponent(cleanDomain)}&type=SOA`, {
      signal: AbortSignal.timeout(3000),
    })
    if (resp.ok) {
      const data: { Answer?: unknown[] } = await resp.json()
      if (data.Answer && data.Answer.length > 0) {
        return false // SOA record → registered
      }
    }
  } catch {
    // Continue
  }

  // No HTTP response + no DNS records → likely available
  return true
}
