import { NextRequest, NextResponse } from 'next/server'
import {
  cleanHostname,
  isHubDomain,
  isDashboardDomain,
  isSpokeDomain,
  SPOKE_SUBDOMAINS,
} from './lib/middleware/config'

/**
 * DBSN Subdomain Middleware Routing.
 * Maps hostnames to their corresponding Next.js Route Groups.
 * - sentradaya.com / www.sentradaya.com -> /(hub) (next.js transparent group)
 * - dashboard.sentradaya.com -> /dashboard
 * - [spoke].sentradaya.com -> /[spoke] (maps to /(spokes)/[spoke] internally)
 * 
 * Runs on the V8 Edge Runtime.
 */
export default function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const hostname = request.headers.get('host')

  // 1. Short-circuit for API, _next static files, and files with extensions
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // 2. Short-circuit for already rewritten paths (to prevent infinite loops)
  const cleanHost = cleanHostname(hostname)
  const isDash = isDashboardDomain(cleanHost)
  const spoke = isSpokeDomain(cleanHost)

  if (
    (pathname.startsWith('/dashboard') && isDash) ||
    pathname.startsWith('/404') ||
    (spoke && pathname.startsWith(`/${spoke}`))
  ) {
    const response = NextResponse.next()
    if (isDash) {
      response.headers.set('x-middleware-subdomain', 'dashboard')
      response.headers.set('x-middleware-matched-route', '/dashboard')
    } else if (spoke) {
      response.headers.set('x-middleware-subdomain', spoke)
      response.headers.set('x-middleware-matched-route', `/(spokes)/${spoke}`)
    }
    return response
  }

  // 3. Hub Domain Routing
  if (isHubDomain(cleanHost)) {
    // If requesting a spoke path directly on the Hub domain, return 404
    if (SPOKE_SUBDOMAINS.some(spoke => pathname.startsWith(`/${spoke}`))) {
      const url = new URL(`/404`, request.url)
      return NextResponse.rewrite(url)
    }
    const response = NextResponse.next()
    response.headers.set('x-middleware-subdomain', 'hub')
    response.headers.set('x-middleware-matched-route', '/(hub)')
    return response
  }

  // 4. Dashboard Domain Routing
  if (isDashboardDomain(cleanHost)) {
    // TODO: Add Auth.js session verification guard in Phase 3
    const url = new URL(`/dashboard${pathname}${search}`, request.url)
    const response = NextResponse.rewrite(url)
    response.headers.set('x-middleware-subdomain', 'dashboard')
    response.headers.set('x-middleware-matched-route', '/dashboard')
    return response
  }

  // 5. Spoke Domain Routing
  if (spoke) {
    const url = new URL(`/${spoke}${pathname}${search}`, request.url)
    const response = NextResponse.rewrite(url)
    response.headers.set('x-middleware-subdomain', spoke)
    response.headers.set('x-middleware-matched-route', `/(spokes)/${spoke}`)
    return response
  }

  // 6. Fallback: unknown domains rewrite to 404
  const url = new URL(`/404`, request.url)
  return NextResponse.rewrite(url)
}

// Limit the middleware to run only on page requests (exclude static assets, api, etc.)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}

