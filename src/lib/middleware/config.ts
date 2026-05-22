import { getMiddlewareEnv } from '../config/env'

export const SPOKE_SUBDOMAINS = ['pju', 'solarcell', 'alatpetir', 'baterai'] as const

/**
 * Strips port numbers from hostname.
 */
export function cleanHostname(host: string | null | undefined): string {
  if (!host) return ''
  const [hostname] = host.split(':')
  return hostname
}

/**
 * Checks if domain is local development (ends with lvh.me).
 */
export function isLocalDevelopment(hostname: string): boolean {
  const clean = cleanHostname(hostname)
  return clean === 'lvh.me' || clean.endsWith('.lvh.me')
}

/**
 * Extracts subdomain relative to ROOT_DOMAIN or local lvh.me.
 */
export function extractSubdomain(hostname: string): string | null {
  if (!hostname) return null
  const clean = cleanHostname(hostname)
  if (!clean || clean === 'localhost' || clean === '127.0.0.1') return null

  const isLocal = isLocalDevelopment(clean)
  let rootDomain: string

  if (isLocal) {
    rootDomain = 'lvh.me'
  } else {
    try {
      rootDomain = getMiddlewareEnv().NEXT_PUBLIC_ROOT_DOMAIN
    } catch {
      rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'sentradaya.com'
    }
  }

  if (clean === rootDomain) return null
  if (!clean.endsWith('.' + rootDomain)) return null

  const subdomain = clean.slice(0, -(rootDomain.length + 1))
  if (subdomain === 'www') return null

  return subdomain || null
}

/**
 * Checks if the domain resolves to the Hub.
 */
export function isHubDomain(hostname: string): boolean {
  const clean = cleanHostname(hostname)
  if (clean === 'localhost' || clean === '127.0.0.1') {
    return true
  }
  const isLocal = isLocalDevelopment(clean)
  let rootDomain: string

  if (isLocal) {
    rootDomain = 'lvh.me'
  } else {
    try {
      rootDomain = getMiddlewareEnv().NEXT_PUBLIC_ROOT_DOMAIN
    } catch {
      rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'sentradaya.com'
    }
  }

  return clean === rootDomain || clean === `www.${rootDomain}`
}

/**
 * Checks if the domain resolves to the Dashboard.
 */
export function isDashboardDomain(hostname: string): boolean {
  return extractSubdomain(hostname) === 'dashboard'
}

/**
 * Checks if the domain resolves to a valid spoke subdomain.
 * Returns the spoke subdomain if valid, or null.
 */
export function isSpokeDomain(hostname: string): string | null {
  const subdomain = extractSubdomain(hostname)
  if (subdomain && (SPOKE_SUBDOMAINS as readonly string[]).includes(subdomain)) {
    return subdomain
  }
  return null
}
