import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'

describe('Middleware Config Resolution Utilities', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should strip port numbers correctly with cleanHostname', async () => {
    const { cleanHostname } = await import('../config')
    expect(cleanHostname('lvh.me:3000')).toBe('lvh.me')
    expect(cleanHostname('sentradaya.com:8080')).toBe('sentradaya.com')
    expect(cleanHostname('pju.lvh.me')).toBe('pju.lvh.me')
    expect(cleanHostname(null)).toBe('')
    expect(cleanHostname(undefined)).toBe('')
    expect(cleanHostname('')).toBe('')
  })

  it('should detect local development domains correctly with isLocalDevelopment', async () => {
    const { isLocalDevelopment } = await import('../config')
    expect(isLocalDevelopment('lvh.me:3000')).toBe(true)
    expect(isLocalDevelopment('pju.lvh.me')).toBe(true)
    expect(isLocalDevelopment('dashboard.lvh.me:3000')).toBe(true)
    expect(isLocalDevelopment('sentradaya.com')).toBe(false)
    expect(isLocalDevelopment('pju.sentradaya.com')).toBe(false)
  })

  it('should extract subdomains correctly relative to ROOT_DOMAIN or lvh.me with extractSubdomain', async () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'sentradaya.com'
    const { extractSubdomain } = await import('../config')

    // Local dev subdomains
    expect(extractSubdomain('lvh.me:3000')).toBeNull()
    expect(extractSubdomain('www.lvh.me:3000')).toBeNull()
    expect(extractSubdomain('pju.lvh.me:3000')).toBe('pju')
    expect(extractSubdomain('dashboard.lvh.me:3000')).toBe('dashboard')

    // Production subdomains
    expect(extractSubdomain('sentradaya.com')).toBeNull()
    expect(extractSubdomain('www.sentradaya.com')).toBeNull()
    expect(extractSubdomain('pju.sentradaya.com')).toBe('pju')
    expect(extractSubdomain('dashboard.sentradaya.com')).toBe('dashboard')

    // Edge cases
    expect(extractSubdomain('')).toBeNull()
    expect(extractSubdomain('127.0.0.1')).toBeNull()
    expect(extractSubdomain('localhost')).toBeNull()
    expect(extractSubdomain('foo.bar.sentradaya.com')).toBe('foo.bar')
  })

  it('should identify hub domains correctly with isHubDomain', async () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'sentradaya.com'
    const { isHubDomain } = await import('../config')

    // Local dev hub
    expect(isHubDomain('lvh.me:3000')).toBe(true)
    expect(isHubDomain('www.lvh.me:3000')).toBe(true)
    expect(isHubDomain('pju.lvh.me:3000')).toBe(false)
    expect(isHubDomain('localhost')).toBe(true)
    expect(isHubDomain('127.0.0.1')).toBe(true)

    // Production hub
    expect(isHubDomain('sentradaya.com')).toBe(true)
    expect(isHubDomain('www.sentradaya.com')).toBe(true)
    expect(isHubDomain('pju.sentradaya.com')).toBe(false)
    expect(isHubDomain('dashboard.sentradaya.com')).toBe(false)
  })

  it('should identify dashboard domains correctly with isDashboardDomain', async () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'sentradaya.com'
    const { isDashboardDomain } = await import('../config')

    expect(isDashboardDomain('dashboard.lvh.me:3000')).toBe(true)
    expect(isDashboardDomain('dashboard.sentradaya.com')).toBe(true)
    expect(isDashboardDomain('pju.sentradaya.com')).toBe(false)
    expect(isDashboardDomain('sentradaya.com')).toBe(false)
  })

  it('should identify valid spoke subdomains correctly with isSpokeDomain', async () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'sentradaya.com'
    const { isSpokeDomain } = await import('../config')

    expect(isSpokeDomain('pju.lvh.me:3000')).toBe('pju')
    expect(isSpokeDomain('solarcell.sentradaya.com')).toBe('solarcell')
    expect(isSpokeDomain('alatpetir.sentradaya.com')).toBe('alatpetir')
    expect(isSpokeDomain('baterai.sentradaya.com')).toBe('baterai')

    expect(isSpokeDomain('dashboard.sentradaya.com')).toBeNull()
    expect(isSpokeDomain('unknown.sentradaya.com')).toBeNull()
    expect(isSpokeDomain('sentradaya.com')).toBeNull()
  })
})
