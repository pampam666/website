import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest, NextResponse } from 'next/server'

describe('Subdomain Routing Middleware Integration', () => {
  const originalEnv = process.env
  let middleware: (request: NextRequest) => NextResponse | Promise<NextResponse>

  beforeEach(async () => {
    jest.resetModules()
    process.env = { ...originalEnv }
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'sentradaya.com'
    const mwModule = await import('../middleware')
    middleware = mwModule.default
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should rewrite hub domain (sentradaya.com) to /(hub) group', async () => {
    const req = new NextRequest('http://sentradaya.com/about?test=1', {
      headers: { host: 'sentradaya.com' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
    expect(res.headers.get('x-middleware-subdomain')).toBe('hub')
    expect(res.headers.get('x-middleware-matched-route')).toBe('/(hub)')
  })

  it('should rewrite hub domain with www to /(hub) group', async () => {
    const req = new NextRequest('http://www.sentradaya.com/contact', {
      headers: { host: 'www.sentradaya.com' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
    expect(res.headers.get('x-middleware-subdomain')).toBe('hub')
    expect(res.headers.get('x-middleware-matched-route')).toBe('/(hub)')
  })

  it('should rewrite dashboard domain to /dashboard folder', async () => {
    const req = new NextRequest('http://dashboard.sentradaya.com/profile', {
      headers: { host: 'dashboard.sentradaya.com' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toContain('/dashboard/profile')
    expect(res.headers.get('x-middleware-subdomain')).toBe('dashboard')
    expect(res.headers.get('x-middleware-matched-route')).toBe('/dashboard')
  })

  it('should rewrite valid spoke subdomain (pju) to /(spokes)/pju', async () => {
    const req = new NextRequest('http://pju.sentradaya.com/products/led', {
      headers: { host: 'pju.sentradaya.com' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toContain('/pju/products/led')
    expect(res.headers.get('x-middleware-subdomain')).toBe('pju')
    expect(res.headers.get('x-middleware-matched-route')).toBe('/(spokes)/pju')
  })

  it('should rewrite valid spoke subdomain (solarcell) in local dev using lvh.me', async () => {
    const req = new NextRequest('http://solarcell.lvh.me:3000/info', {
      headers: { host: 'solarcell.lvh.me:3000' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toContain('/solarcell/info')
    expect(res.headers.get('x-middleware-subdomain')).toBe('solarcell')
    expect(res.headers.get('x-middleware-matched-route')).toBe('/(spokes)/solarcell')
  })

  it('should rewrite local dev hub (lvh.me:3000) to /(hub) group', async () => {
    const req = new NextRequest('http://lvh.me:3000/', {
      headers: { host: 'lvh.me:3000' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
    expect(res.headers.get('x-middleware-subdomain')).toBe('hub')
    expect(res.headers.get('x-middleware-matched-route')).toBe('/(hub)')
  })

  it('should rewrite unknown subdomains to /404 page', async () => {
    const req = new NextRequest('http://invalid.sentradaya.com/some-path', {
      headers: { host: 'invalid.sentradaya.com' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toContain('/404')
  })

  it('should short-circuit and do nothing for API routes', async () => {
    const req = new NextRequest('http://pju.sentradaya.com/api/rfq', {
      headers: { host: 'pju.sentradaya.com' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    // Should be a NextResponse.next() which doesn't rewrite
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('should short-circuit and do nothing for static files and _next', async () => {
    const req = new NextRequest('http://pju.sentradaya.com/_next/static/chunks/main.js', {
      headers: { host: 'pju.sentradaya.com' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('should short-circuit and set correct headers for already rewritten dashboard path', async () => {
    const req = new NextRequest('http://dashboard.sentradaya.com/dashboard/profile', {
      headers: { host: 'dashboard.sentradaya.com' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
    expect(res.headers.get('x-middleware-subdomain')).toBe('dashboard')
    expect(res.headers.get('x-middleware-matched-route')).toBe('/dashboard')
  })

  it('should short-circuit and set correct headers for already rewritten spoke path', async () => {
    const req = new NextRequest('http://pju.sentradaya.com/pju/products/led', {
      headers: { host: 'pju.sentradaya.com' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
    expect(res.headers.get('x-middleware-subdomain')).toBe('pju')
    expect(res.headers.get('x-middleware-matched-route')).toBe('/(spokes)/pju')
  })

  it('should rewrite to 404 if direct spoke path is requested on hub domain', async () => {
    const req = new NextRequest('http://sentradaya.com/pju/products/led', {
      headers: { host: 'sentradaya.com' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toContain('/404')
  })
})
