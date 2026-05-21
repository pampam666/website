import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  getProductsBySpoke,
  getProductBySlug,
  getCertifications,
  getCertificationBySlug,
  getPortfolioEntries,
  getPortfolioBySlug,
  getSpokeConfig,
  getAllSpokeConfigs,
  getPageBySlug,
} from '../queries'

jest.mock('@sanity/client', () => ({
  createClient: jest.fn(),
}))

jest.mock('@sanity/image-url', () => jest.fn())

jest.mock('@/lib/config/env', () => ({
  getSanityEnv: jest.fn(() => ({
    SANITY_PROJECT_ID: 'test-project',
    SANITY_DATASET: 'production',
    SANITY_API_VERSION: 'v2025-05-21',
    SANITY_API_READ_TOKEN: 'sk-test-token',
  })),
}))

const mockProducts = [
  {
    _id: 'prod-1',
    _type: 'product',
    title: 'PJU Solar Cell',
    slug: { current: 'pju-solar-cell' },
    spoke: { _id: 'spoke-1', subdomain: 'pju', name: 'PJU' },
    shortDescription: 'High efficiency solar cell',
    fullDescription: [],
    specifications: [],
    images: [],
    relatedCertifications: [],
    seoMeta: { title: 'PJU Solar Cell', description: '...' },
  },
]

const mockCertifications = [
  {
    _id: 'cert-1',
    _type: 'certification',
    title: 'SNI Certification',
    slug: { current: 'sni-cert' },
    certificationBody: 'BSN',
    certType: 'SNI' as const,
    issueDate: '2024-01-01',
    expiryDate: '2027-01-01',
    isIndexable: true,
    seoMeta: { title: 'SNI', description: '...' },
  },
]

const mockSpokeConfig = {
  _id: 'spoke-1',
  _type: 'spokeConfig',
  name: 'PJU',
  subdomain: 'pju',
  tagline: 'Penerangan Jalan Umum',
  primaryColor: '#3b82f6',
  featuredProducts: [],
  seoDefaults: { title: 'PJU', description: '...' },
}

describe('getProductsBySpoke', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return products for a spoke', async () => {
    const { createClient } = require('@sanity/client')
    const mockClient = {
      fetch: jest.fn().mockResolvedValue(mockProducts),
    }
    createClient.mockReturnValue(mockClient)

    const result = await getProductsBySpoke('pju')

    expect(mockClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining('spoke.subdomain == $subdomain'),
      { subdomain: 'pju' },
      expect.any(Object),
    )
    expect(result).toEqual(mockProducts)
  })

  it('should return null on error', async () => {
    const { createClient } = require('@sanity/client')
    const mockClient = {
      fetch: jest.fn().mockRejectedValue(new Error('Network error')),
    }
    createClient.mockReturnValue(mockClient)

    const result = await getProductsBySpoke('pju')

    expect(result).toBeNull()
  })
})

describe('getProductBySlug', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return single product by slug', async () => {
    const { createClient } = require('@sanity/client')
    const mockClient = {
      fetch: jest.fn().mockResolvedValue(mockProducts[0]),
    }
    createClient.mockReturnValue(mockClient)

    const result = await getProductBySlug('pju-solar-cell')

    expect(mockClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining('slug.current == $slug'),
      { slug: 'pju-solar-cell' },
      expect.any(Object),
    )
    expect(result).toEqual(mockProducts[0])
  })

  it('should return null for non-existent product', async () => {
    const { createClient } = require('@sanity/client')
    const mockClient = {
      fetch: jest.fn().mockResolvedValue(null),
    }
    createClient.mockReturnValue(mockClient)

    const result = await getProductBySlug('nonexistent')

    expect(result).toBeNull()
  })
})

describe('getCertifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return indexable certifications', async () => {
    const { createClient } = require('@sanity/client')
    const mockClient = {
      fetch: jest.fn().mockResolvedValue(mockCertifications),
    }
    createClient.mockReturnValue(mockClient)

    const result = await getCertifications()

    expect(mockClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining('isIndexable == true'),
      {},
      expect.any(Object),
    )
    expect(result).toEqual(mockCertifications)
  })

  it('should return null on error', async () => {
    const { createClient } = require('@sanity/client')
    const mockClient = {
      fetch: jest.fn().mockRejectedValue(new Error('Network error')),
    }
    createClient.mockReturnValue(mockClient)

    const result = await getCertifications()

    expect(result).toBeNull()
  })
})

describe('getPortfolioEntries', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return all portfolio entries', async () => {
    const { createClient } = require('@sanity/client')
    const mockClient = {
      fetch: jest.fn().mockResolvedValue([]),
    }
    createClient.mockReturnValue(mockClient)

    const result = await getPortfolioEntries()

    expect(mockClient.fetch).toHaveBeenCalled()
    expect(result).toEqual([])
  })

  it('should filter portfolio by spoke', async () => {
    const { createClient } = require('@sanity/client')
    const mockClient = {
      fetch: jest.fn().mockResolvedValue([]),
    }
    createClient.mockReturnValue(mockClient)

    const result = await getPortfolioEntries('pju')

    expect(mockClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining('relatedSpoke.subdomain == $subdomain'),
      { subdomain: 'pju' },
      expect.any(Object),
    )
    expect(result).toEqual([])
  })
})

describe('getSpokeConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return spoke config by subdomain', async () => {
    const { createClient } = require('@sanity/client')
    const mockClient = {
      fetch: jest.fn().mockResolvedValue(mockSpokeConfig),
    }
    createClient.mockReturnValue(mockClient)

    const result = await getSpokeConfig('pju')

    expect(mockClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining('subdomain == $subdomain'),
      { subdomain: 'pju' },
      expect.any(Object),
    )
    expect(result).toEqual(mockSpokeConfig)
  })

  it('should return null for non-existent spoke', async () => {
    const { createClient } = require('@sanity/client')
    const mockClient = {
      fetch: jest.fn().mockResolvedValue(null),
    }
    createClient.mockReturnValue(mockClient)

    const result = await getSpokeConfig('nonexistent')

    expect(result).toBeNull()
  })
})

describe('getAllSpokeConfigs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return all spoke configs for navigation', async () => {
    const { createClient } = require('@sanity/client')
    const mockClient = {
      fetch: jest.fn().mockResolvedValue([mockSpokeConfig]),
    }
    createClient.mockReturnValue(mockClient)

    const result = await getAllSpokeConfigs()

    expect(mockClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining('_type == "spokeConfig"'),
      {},
      expect.any(Object),
    )
    expect(result).toEqual([mockSpokeConfig])
  })
})

describe('getPageBySlug', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return page by slug', async () => {
    const { createClient } = require('@sanity/client')
    const mockPage = {
      _id: 'page-1',
      _type: 'page',
      title: 'Test Page',
      slug: { current: 'test' },
      sections: [],
      seoMeta: { title: 'Test', description: '...' },
    }
    const mockClient = {
      fetch: jest.fn().mockResolvedValue(mockPage),
    }
    createClient.mockReturnValue(mockClient)

    const result = await getPageBySlug('test')

    expect(mockClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining('slug.current == $slug'),
      { slug: 'test', subdomain: undefined },
      expect.any(Object),
    )
    expect(result).toEqual(mockPage)
  })

  it('should filter page by spoke', async () => {
    const { createClient } = require('@sanity/client')
    const mockClient = {
      fetch: jest.fn().mockResolvedValue(null),
    }
    createClient.mockReturnValue(mockClient)

    const result = await getPageBySlug('test', 'pju')

    expect(mockClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining('targetSpoke.subdomain == $subdomain'),
      { slug: 'test', subdomain: 'pju' },
      expect.any(Object),
    )
  })
})