import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'

describe('Middleware Env Config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should validate and return default values for development environment', async () => {
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'development'
    delete process.env.NEXT_PUBLIC_ROOT_DOMAIN
    delete process.env.NEXT_PUBLIC_SITE_URL

    const { getMiddlewareEnv, validateMiddlewareEnv } = await import('../env')

    const config = validateMiddlewareEnv()
    expect(config.NEXT_PUBLIC_ROOT_DOMAIN).toBe('lvh.me')
    expect(config.NEXT_PUBLIC_SITE_URL).toBe('http://lvh.me:3000')

    const cached = getMiddlewareEnv()
    expect(cached).toEqual(config)
  })

  it('should validate and return default values for production environment', async () => {
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'production'
    delete process.env.NEXT_PUBLIC_ROOT_DOMAIN
    delete process.env.NEXT_PUBLIC_SITE_URL

    const { validateMiddlewareEnv } = await import('../env')

    const config = validateMiddlewareEnv()
    expect(config.NEXT_PUBLIC_ROOT_DOMAIN).toBe('sentradaya.com')
    expect(config.NEXT_PUBLIC_SITE_URL).toBe('https://sentradaya.com')
  })

  it('should use environment variables when they are defined', async () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'customdomain.com'
    process.env.NEXT_PUBLIC_SITE_URL = 'https://customdomain.com'

    const { validateMiddlewareEnv } = await import('../env')

    const config = validateMiddlewareEnv()
    expect(config.NEXT_PUBLIC_ROOT_DOMAIN).toBe('customdomain.com')
    expect(config.NEXT_PUBLIC_SITE_URL).toBe('https://customdomain.com')
  })

  it('should fail validation when site URL is invalid', async () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'customdomain.com'
    process.env.NEXT_PUBLIC_SITE_URL = 'not-a-valid-url'

    const { validateMiddlewareEnv } = await import('../env')

    expect(() => validateMiddlewareEnv()).toThrow(/Site URL must be a valid URL/)
  })

  describe('Sanity Env Config', () => {
    beforeEach(() => {
      process.env.SANITY_PROJECT_ID = 'abcdef12'
      process.env.SANITY_DATASET = 'production'
      process.env.SANITY_API_VERSION = 'v2026-05-21'
      process.env.SANITY_API_READ_TOKEN = 'skreadsuff'
      process.env.SANITY_API_WRITE_TOKEN = 'skwritesuff'
    })

    it('should validate and return sanity env successfully', async () => {
      const { validateSanityEnv, getSanityEnv } = await import('../env')
      const env = validateSanityEnv()
      expect(env.SANITY_PROJECT_ID).toBe('abcdef12')
      expect(env.SANITY_DATASET).toBe('production')

      const cached = getSanityEnv()
      expect(cached).toEqual(env)
    })

    it('should throw error when a required variable is missing', async () => {
      delete process.env.SANITY_PROJECT_ID
      const { validateSanityEnv } = await import('../env')
      expect(() => validateSanityEnv()).toThrow(/Sanity environment validation failed/)
    })

    it('should throw error when token is invalid', async () => {
      process.env.SANITY_API_READ_TOKEN = 'invalid-token'
      const { validateSanityEnv } = await import('../env')
      expect(() => validateSanityEnv()).toThrow(/Read token must start with "sk"/)
    })
  })
})

