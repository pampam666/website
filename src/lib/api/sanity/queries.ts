import { groq, defineQuery } from 'next-sanity'
import { client, CACHE_TAGS, type FetchOptions } from './client'
import type {
  ProductWithRelations,
  Certification,
  PortfolioWithRelations,
  SpokeConfig,
  SpokeConfigWithProducts,
  PageWithSpoke,
} from './types'

/**
 * Query options for Sanity fetches.
 */
export interface QueryOptions {
  preview?: boolean
}

// ============================================================================
// Product Queries
// ============================================================================

const productFields = groq`
  _id,
  _type,
  title,
  "slug": slug.current,
  spoke->{_id, subdomain, name},
  shortDescription,
  fullDescription,
  specifications,
  images,
  datasheetFile,
  relatedCertifications->{_id, title, "slug": slug.current},
  seoMeta
`

/**
 * Fetch all products for a specific spoke subdomain.
 *
 * @param spokeSubdomain - Subdomain to filter by (e.g., "pju", "solarcell")
 * @param options - Query options
 * @returns Array of products with relations expanded, or null
 */
export async function getProductsBySpoke(
  spokeSubdomain: string,
): Promise<ProductWithRelations[] | null> {
  const query = defineQuery(groq`
    *[_type == "product" && spoke.subdomain == $subdomain]{
      ${productFields}
    }|order(title asc)
  `)

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags: [CACHE_TAGS.product(), CACHE_TAGS.spoke(spokeSubdomain)],
    },
  }

  try {
    return await client.fetch(query, { subdomain: spokeSubdomain }, fetchOptions)
  } catch {
    return null
  }
}

/**
 * Fetch a single product by slug.
 *
 * @param slug - Product slug
 * @param options - Query options
 * @returns Product with relations, or null
 */
export async function getProductBySlug(
  slug: string,
): Promise<ProductWithRelations | null> {
  const query = defineQuery(groq`
    *[_type == "product" && slug.current == $slug][0]{
      ${productFields}
    }
  `)

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags: [CACHE_TAGS.product()],
    },
  }

  try {
    return await client.fetch(query, { slug }, fetchOptions)
  } catch {
    return null
  }
}

// ============================================================================
// Certification Queries
// ============================================================================

const certificationFields = groq`
  _id,
  _type,
  title,
  "slug": slug.current,
  certificationBody,
  certType,
  issueDate,
  expiryDate,
  documentFile,
  coverImage,
  isIndexable,
  seoMeta
`

/**
 * Fetch all indexable certifications.
 *
 * @param options - Query options
 * @returns Array of certifications, or null
 */
export async function getCertifications(): Promise<Certification[] | null> {
  const query = defineQuery(groq`
    *[_type == "certification" && isIndexable == true]{
      ${certificationFields}
    }|order(certType asc, title asc)
  `)

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags: [CACHE_TAGS.certification()],
    },
  }

  try {
    return await client.fetch(query, {}, fetchOptions)
  } catch {
    return null
  }
}

/**
 * Fetch a single certification by slug.
 *
 * @param slug - Certification slug
 * @param options - Query options
 * @returns Certification, or null
 */
export async function getCertificationBySlug(
  slug: string,
): Promise<Certification | null> {
  const query = defineQuery(groq`
    *[_type == "certification" && slug.current == $slug][0]{
      ${certificationFields}
    }
  `)

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags: [CACHE_TAGS.certification()],
    },
  }

  try {
    return await client.fetch(query, { slug }, fetchOptions)
  } catch {
    return null
  }
}

// ============================================================================
// Portfolio Queries
// ============================================================================

const portfolioFields = groq`
  _id,
  _type,
  title,
  "slug": slug.current,
  projectType,
  clientCategory,
  location,
  completionYear,
  scopeDescription,
  outcome,
  images,
  relatedSpoke->{_id, subdomain, name},
  relatedProducts->{_id, title, "slug": slug.current},
  seoMeta
`

/**
 * Fetch portfolio entries, optionally filtered by spoke.
 *
 * @param spokeSubdomain - Optional subdomain filter
 * @param options - Query options
 * @returns Array of portfolio entries, or null
 */
export async function getPortfolioEntries(
  spokeSubdomain?: string,
): Promise<PortfolioWithRelations[] | null> {
  const baseQuery = spokeSubdomain
    ? `*[_type == "portfolioEntry" && relatedSpoke.subdomain == $subdomain]`
    : `*[_type == "portfolioEntry"]`

  const query = defineQuery(groq`
    ${baseQuery}{
      ${portfolioFields}
    }|order(completionYear desc, title asc)
  `)

  const tags = [CACHE_TAGS.portfolio()]
  if (spokeSubdomain) {
    tags.push(CACHE_TAGS.spoke(spokeSubdomain))
  }

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags,
    },
  }

  try {
    return await client.fetch(
      query,
      { subdomain: spokeSubdomain },
      fetchOptions,
    )
  } catch {
    return null
  }
}

/**
 * Fetch a single portfolio entry by slug.
 *
 * @param slug - Portfolio entry slug
 * @param options - Query options
 * @returns Portfolio entry with relations, or null
 */
export async function getPortfolioBySlug(
  slug: string,
): Promise<PortfolioWithRelations | null> {
  const query = defineQuery(groq`
    *[_type == "portfolioEntry" && slug.current == $slug][0]{
      ${portfolioFields}
    }
  `)

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags: [CACHE_TAGS.portfolio()],
    },
  }

  try {
    return await client.fetch(query, { slug }, fetchOptions)
  } catch {
    return null
  }
}

// ============================================================================
// Spoke Config Queries
// ============================================================================

const spokeConfigFields = groq`
  _id,
  _type,
  name,
  subdomain,
  tagline,
  heroImage,
  primaryColor,
  featuredProducts->{_id, title, "slug": slug.current, shortDescription, images},
  seoDefaults
`

/**
 * Fetch spoke configuration by subdomain.
 *
 * @param subdomain - Spoke subdomain
 * @param options - Query options
 * @returns Spoke config with products, or null
 */
export async function getSpokeConfig(
  subdomain: string,
): Promise<SpokeConfigWithProducts | null> {
  const query = defineQuery(groq`
    *[_type == "spokeConfig" && subdomain == $subdomain][0]{
      ${spokeConfigFields}
    }
  `)

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags: [CACHE_TAGS.spokeConfig(), CACHE_TAGS.spoke(subdomain)],
    },
  }

  try {
    return await client.fetch(query, { subdomain }, fetchOptions)
  } catch {
    return null
  }
}

/**
 * Fetch all spoke configurations for navigation.
 *
 * @param options - Query options
 * @returns Array of all spoke configs, or null
 */
export async function getAllSpokeConfigs(): Promise<SpokeConfig[] | null> {
  const query = defineQuery(groq`
    *[_type == "spokeConfig"]{
      _id,
      _type,
      name,
      subdomain,
      tagline,
      primaryColor
    }|order(name asc)
  `)

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags: [CACHE_TAGS.spokeConfig()],
    },
  }

  try {
    return await client.fetch(query, {}, fetchOptions)
  } catch {
    return null
  }
}

// ============================================================================
// Page Queries
// ============================================================================

const pageFields = groq`
  _id,
  _type,
  title,
  "slug": slug.current,
  targetSpoke->{_id, subdomain, name},
  sections,
  seoMeta
`

/**
 * Fetch a page by slug, optionally filtered by spoke.
 *
 * @param slug - Page slug
 * @param spokeSubdomain - Optional spoke subdomain filter
 * @param options - Query options
 * @returns Page with relations, or null
 */
export async function getPageBySlug(
  slug: string,
  spokeSubdomain?: string,
): Promise<PageWithSpoke | null> {
  const baseQuery = spokeSubdomain
    ? `*[_type == "page" && slug.current == $slug && targetSpoke.subdomain == $subdomain]`
    : `*[_type == "page" && slug.current == $slug]`

  const query = defineQuery(groq`
    ${baseQuery}[0]{
      ${pageFields}
    }
  `)

  const tags = [CACHE_TAGS.page()]
  if (spokeSubdomain) {
    tags.push(CACHE_TAGS.spoke(spokeSubdomain))
  }

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags,
    },
  }

  try {
    return await client.fetch(
      query,
      { slug, subdomain: spokeSubdomain },
      fetchOptions,
    )
  } catch {
    return null
  }
}