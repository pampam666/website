/**
 * Sanity CMS content type definitions.
 * These interfaces mirror the Sanity schema structure and GROQ projections.
 */

// ============================================================================
// Shared Types
// ============================================================================

/**
 * Portable text block from Sanity CMS.
 * Processed with @portabletext/react in components.
 */
export type PortableTextBlock = unknown[]

/**
 * SEO metadata for CMS content.
 */
export interface SeoMeta {
  title: string
  description: string
  ogImage?: ImageAsset
}

/**
 * Sanity image asset structure.
 */
export interface ImageAsset {
  _key: string
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
  crop?: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

/**
 * Sanity file asset structure.
 */
export interface FileAsset {
  _key: string
  _type: 'file'
  asset: {
    _ref: string
    _type: 'reference'
  }
}

// ============================================================================
// Product
// ============================================================================

export interface Specification {
  key: string
  value: string
}

export interface Product {
  _id: string
  _type: 'product'
  title: string
  slug: {
    current: string
  }
  spoke: {
    _ref: string
  }
  shortDescription: string
  fullDescription: PortableTextBlock
  specifications: Specification[]
  images: ImageAsset[]
  datasheetFile?: FileAsset
  relatedCertifications: CertificationRef[]
  seoMeta: SeoMeta
}

/**
 * Lightweight certification reference within Product.
 */
export interface CertificationRef {
  _ref: string
  _type: 'reference'
}

// ============================================================================
// Certification
// ============================================================================

export type CertType = 'SNI' | 'TKDN' | 'LKPP' | 'ISO' | 'Other'

export interface Certification {
  _id: string
  _type: 'certification'
  title: string
  slug: {
    current: string
  }
  certificationBody: string
  certType: CertType
  issueDate: string
  expiryDate: string
  documentFile?: FileAsset
  coverImage?: ImageAsset
  isIndexable: boolean
  seoMeta: SeoMeta
}

// ============================================================================
// Portfolio Entry
// ============================================================================

export type ClientCategory = 'Government' | 'BUMN' | 'Private' | 'EPC'

export interface PortfolioEntry {
  _id: string
  _type: 'portfolioEntry'
  title: string
  slug: {
    current: string
  }
  projectType: string
  clientCategory: ClientCategory
  location: string
  completionYear: number
  scopeDescription: PortableTextBlock
  outcome: string
  images: ImageAsset[]
  relatedSpoke?: {
    _ref: string
  }
  relatedProducts: ProductRef[]
  seoMeta: SeoMeta
}

/**
 * Lightweight product reference within PortfolioEntry.
 */
export interface ProductRef {
  _ref: string
  _type: 'reference'
}

// ============================================================================
// Spoke Configuration
// ============================================================================

export interface SpokeConfig {
  _id: string
  _type: 'spokeConfig'
  name: string
  subdomain: string
  tagline: string
  heroImage?: ImageAsset
  primaryColor: string
  featuredProducts: FeaturedProduct[]
  seoDefaults: SeoMeta
}

/**
 * Featured product with expanded fields.
 */
export interface FeaturedProduct {
  _id: string
  title: string
  slug: {
    current: string
  }
  shortDescription: string
  images: ImageAsset[]
}

// ============================================================================
// Page
// ============================================================================

export interface Page {
  _id: string
  _type: 'page'
  title: string
  slug: {
    current: string
  }
  targetSpoke?: {
    _ref: string
  }
  sections: PortableTextBlock | CustomBlock[]
  seoMeta: SeoMeta
}

/**
 * Custom block for page sections.
 */
export interface CustomBlock {
  _key: string
  _type: string
  [key: string]: unknown
}

// ============================================================================
// Query Result Types
// ============================================================================

/**
 * Product with spoke and certifications expanded.
 */
export interface ProductWithRelations extends Omit<Product, 'spoke' | 'relatedCertifications'> {
  spoke: {
    _id: string
    subdomain: string
    name: string
  }
  relatedCertifications: Array<{
    _id: string
    title: string
    slug: {
      current: string
    }
  }>
}

/**
 * Portfolio entry with spoke and products expanded.
 */
export interface PortfolioWithRelations extends Omit<PortfolioEntry, 'relatedSpoke' | 'relatedProducts'> {
  relatedSpoke?: {
    _id: string
    subdomain: string
    name: string
  }
  relatedProducts: Array<{
    _id: string
    title: string
    slug: {
      current: string
    }
  }>
}

/**
 * Spoke config with products fully expanded.
 */
export interface SpokeConfigWithProducts extends Omit<SpokeConfig, 'featuredProducts'> {
  featuredProducts: Array<{
    _id: string
    title: string
    slug: {
      current: string
    }
    shortDescription: string
    images: ImageAsset[]
  }>
}

/**
 * Page with optional spoke reference expanded.
 */
export interface PageWithSpoke extends Omit<Page, 'targetSpoke'> {
  targetSpoke?: {
    _id: string
    subdomain: string
    name: string
  } | null
}