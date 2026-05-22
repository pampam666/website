import { describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('next-sanity', () => ({
  groq: (strings: TemplateStringsArray, ...keys: unknown[]) => {
    let result = ''
    strings.forEach((str, i) => {
      result += str + (keys[i] || '')
    })
    return result
  },
  defineQuery: (q: string) => q,
}))

const mockFetch = jest.fn()

jest.mock('../client', () => ({
  client: {
    fetch: (query: unknown, params?: unknown, options?: unknown) => mockFetch(query, params, options),
  },
  CACHE_TAGS: {
    product: (id?: string) => (id ? `sanity:product:${id}` : 'sanity:product'),
    certification: (id?: string) => id ? `sanity:certification:${id}` : 'sanity:certification',
    portfolio: (id?: string) => id ? `sanity:portfolio:${id}` : 'sanity:portfolio',
    spoke: (subdomain: string) => `sanity:spoke:${subdomain}`,
    spokeConfig: (id?: string) => id ? `sanity:spokeConfig:${id}` : 'sanity:spokeConfig',
    page: (id?: string) => id ? `sanity:page:${id}` : 'sanity:page',
    all: 'sanity:all',
  },
}))

describe('GROQ Queries', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('getProductsBySpoke', () => {
    it('should fetch products by spoke subdomain', async () => {
      const mockProducts = [{ _id: 'prod-1', title: 'Solar Panel' }]
      mockFetch.mockResolvedValueOnce(mockProducts)

      const { getProductsBySpoke } = await import('../queries')
      const result = await getProductsBySpoke('pju')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        { subdomain: 'pju' },
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['sanity:product', 'sanity:spoke:pju']),
          }),
        }),
      )
      expect(result).toEqual(mockProducts)
    })

    it('should return null on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection error'))

      const { getProductsBySpoke } = await import('../queries')
      const result = await getProductsBySpoke('pju')

      expect(result).toBeNull()
    })
  })

  describe('getProductBySlug', () => {
    it('should fetch a single product by slug', async () => {
      const mockProduct = { _id: 'prod-1', title: 'Solar Panel' }
      mockFetch.mockResolvedValueOnce(mockProduct)

      const { getProductBySlug } = await import('../queries')
      const result = await getProductBySlug('solar-panel')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        { slug: 'solar-panel' },
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['sanity:product']),
          }),
        }),
      )
      expect(result).toEqual(mockProduct)
    })
  })

  describe('getCertifications', () => {
    it('should fetch indexable certifications', async () => {
      const mockCertifications = [{ _id: 'cert-1', title: 'SNI' }]
      mockFetch.mockResolvedValueOnce(mockCertifications)

      const { getCertifications } = await import('../queries')
      const result = await getCertifications()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        {},
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['sanity:certification']),
          }),
        }),
      )
      expect(result).toEqual(mockCertifications)
    })
  })

  describe('getCertificationBySlug', () => {
    it('should fetch a single certification by slug', async () => {
      const mockCertification = { _id: 'cert-1', title: 'SNI' }
      mockFetch.mockResolvedValueOnce(mockCertification)

      const { getCertificationBySlug } = await import('../queries')
      const result = await getCertificationBySlug('sni')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        { slug: 'sni' },
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['sanity:certification']),
          }),
        }),
      )
      expect(result).toEqual(mockCertification)
    })
  })

  describe('getPortfolioEntries', () => {
    it('should fetch portfolio entries optionally filtered by subdomain', async () => {
      const mockPortfolio = [{ _id: 'port-1', title: 'Project 1' }]
      mockFetch.mockResolvedValueOnce(mockPortfolio)

      const { getPortfolioEntries } = await import('../queries')
      const result = await getPortfolioEntries('pju')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        { subdomain: 'pju' },
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['sanity:portfolio', 'sanity:spoke:pju']),
          }),
        }),
      )
      expect(result).toEqual(mockPortfolio)
    })

    it('should fetch all portfolio entries when subdomain is not passed', async () => {
      const mockPortfolio = [{ _id: 'port-1', title: 'Project 1' }]
      mockFetch.mockResolvedValueOnce(mockPortfolio)

      const { getPortfolioEntries } = await import('../queries')
      const result = await getPortfolioEntries()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        { subdomain: undefined },
        expect.objectContaining({
          next: expect.objectContaining({
            tags: ['sanity:portfolio'],
          }),
        }),
      )
      expect(result).toEqual(mockPortfolio)
    })
  })

  describe('getPortfolioBySlug', () => {
    it('should fetch a single portfolio entry by slug', async () => {
      const mockPortfolio = { _id: 'port-1', title: 'Project 1' }
      mockFetch.mockResolvedValueOnce(mockPortfolio)

      const { getPortfolioBySlug } = await import('../queries')
      const result = await getPortfolioBySlug('project-1')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        { slug: 'project-1' },
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['sanity:portfolio']),
          }),
        }),
      )
      expect(result).toEqual(mockPortfolio)
    })
  })

  describe('getSpokeConfig', () => {
    it('should fetch spoke config by subdomain', async () => {
      const mockConfig = { _id: 'cfg-1', subdomain: 'pju' }
      mockFetch.mockResolvedValueOnce(mockConfig)

      const { getSpokeConfig } = await import('../queries')
      const result = await getSpokeConfig('pju')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        { subdomain: 'pju' },
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['sanity:spokeConfig', 'sanity:spoke:pju']),
          }),
        }),
      )
      expect(result).toEqual(mockConfig)
    })
  })

  describe('getAllSpokeConfigs', () => {
    it('should fetch all spoke configs', async () => {
      const mockConfigs = [{ _id: 'cfg-1', subdomain: 'pju' }]
      mockFetch.mockResolvedValueOnce(mockConfigs)

      const { getAllSpokeConfigs } = await import('../queries')
      const result = await getAllSpokeConfigs()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        {},
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['sanity:spokeConfig']),
          }),
        }),
      )
      expect(result).toEqual(mockConfigs)
    })
  })

  describe('getPageBySlug', () => {
    it('should fetch page by slug and optionally by spoke subdomain', async () => {
      const mockPage = { _id: 'page-1', slug: 'home' }
      mockFetch.mockResolvedValueOnce(mockPage)

      const { getPageBySlug } = await import('../queries')
      const result = await getPageBySlug('home', 'pju')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        { slug: 'home', subdomain: 'pju' },
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['sanity:page', 'sanity:spoke:pju']),
          }),
        }),
      )
      expect(result).toEqual(mockPage)
    })
  })
})
