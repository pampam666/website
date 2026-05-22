import { cleanHostname } from './config'

/**
 * Mappings of development hostnames to their corresponding route groups.
 * These are used to test subdomain routing locally using lvh.me (which resolves to 127.0.0.1).
 */
export const DEV_HOSTNAMES = {
  'lvh.me': '(hub)',
  'www.lvh.me': '(hub)',
  'dashboard.lvh.me': '/dashboard',
  'pju.lvh.me': '(spokes)/pju',
  'solarcell.lvh.me': '(spokes)/solarcell',
  'alatpetir.lvh.me': '(spokes)/alatpetir',
  'baterai.lvh.me': '(spokes)/baterai',
} as const

export type DevHostname = keyof typeof DEV_HOSTNAMES

/**
 * Returns the expected internal route group path for a given local development hostname.
 * Returns null if the hostname is not a recognized development host.
 */
export function getExpectedRoute(hostname: string | null | undefined): string | null {
  if (!hostname) return null
  const clean = cleanHostname(hostname)
  if (clean in DEV_HOSTNAMES) {
    return DEV_HOSTNAMES[clean as DevHostname]
  }
  return null
}
