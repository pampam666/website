# Data Codemap

<!-- Generated: 2026-05-26 | Files scanned: 10 | Token estimate: ~550 -->

## Sanity CMS Integration (Active)

### Client (`src/lib/api/sanity/client.ts`, 88 lines)
```
createClient({ projectId, dataset, apiVersion, useCdn, perspective: 'published', stega })
CACHE_TAGS → sanity:product | sanity:certification | sanity:portfolio | sanity:spoke:* | sanity:page | sanity:all
createFetchOptions(tags, revalidate?) → { next: { revalidate: 3600, tags } }
```

### Queries (`src/lib/api/sanity/queries.ts`, 429 lines)

| Function | GROQ Type | Cache Tags |
|----------|-----------|-----------|
| `getProductsBySpoke(subdomain)` | `*[_type=="product" && spoke.subdomain==$subdomain]` | product + spoke |
| `getProductBySlug(slug)` | `*[_type=="product" && slug.current==$slug][0]` | product |
| `getProductSlugsWithSpokes()` | `*[_type=="product"]{slug, subdomain}` | product |
| `getCertifications()` | `*[_type=="certification" && isIndexable==true]` | certification |
| `getCertificationBySlug(slug)` | `*[_type=="certification"...][0]` | certification |
| `getPortfolioEntries(spoke?)` | `*[_type=="portfolioEntry"]` | portfolio ± spoke |
| `getPortfolioBySlug(slug)` | `*[_type=="portfolioEntry"...][0]` | portfolio |
| `getSpokeConfig(subdomain)` | `*[_type=="spokeConfig" && subdomain==$subdomain][0]` | spokeConfig + spoke |
| `getAllSpokeConfigs()` | `*[_type=="spokeConfig"]` | spokeConfig |
| `getPageBySlug(slug, spoke?)` | `*[_type=="page"...][0]` | page ± spoke |

### Types (`src/lib/api/sanity/types.ts`, 272 lines)

| Type | Fields |
|------|--------|
| `Product` | _id, title, slug, spoke, shortDescription, fullDescription (PortableText), specifications, images, datasheetUrl, relatedCertifications, seoMeta |
| `Certification` | _id, title, slug, certificationBody, certType (SNI/TKDN/LKPP/ISO/Other), issueDate, expiryDate, documentUrl, coverImage, isIndexable, seoMeta |
| `PortfolioEntry` | _id, title, slug, projectType, clientCategory (Government/BUMN/Private/EPC), location, completionYear, scopeDescription, outcome, images, relatedSpoke, relatedProducts, seoMeta |
| `SpokeConfig` | _id, name, subdomain, tagline, heroImage, primaryColor, featuredProducts, seoDefaults |
| `Page` | _id, title, slug, targetSpoke, sections, seoMeta |
| `ProductWithRelations` | Product + expanded spoke{_id, subdomain, name} + expanded relatedCertifications |
| `PortfolioWithRelations` | PortfolioEntry + expanded relatedSpoke + relatedProducts |
| `SpokeConfigWithProducts` | SpokeConfig + expanded featuredProducts{_id, title, slug, shortDescription, images} |

### Image Helper (`src/lib/api/sanity/image.ts`, 69 lines)
```
imageUrlBuilder(client) → urlFor(source).width(w).height(h).auto('format').url()
```

## Static Data Layer

### Articles (`src/lib/api/articles.ts`, 174 lines)
```
Article { id, slug, title, category, excerpt, content, author, publishedAt, readingTime }
articles: Article[]  → 6 static articles (Energi Terbarukan, Regulasi, Industri, Teknik, Teknologi)
getArticleBySlug(slug) → Article | undefined
```

## Validation Schemas

### RFQ (`src/lib/schema/rfq-schemas.ts`, ~80 lines)
```
contact_name, contact_email, contact_phone, company_name
product_category, quantity, project_scope, timeline, notes
segment: "B2G" | "B2B"
procurement_type: Tender Langsung | Tender Umum | Penunjukan Langsung | E-Purchasing
dipa_reference (B2G)
source_domain, source_page_path, utm_source/medium/campaign
```

### Env (`src/lib/config/env.ts`)
```
sanityEnvSchema: SANITY_PROJECT_ID, DATASET, API_VERSION, API_READ_TOKEN, API_WRITE_TOKEN?, WEBHOOK_SECRET?
middlewareEnvSchema: NEXT_PUBLIC_ROOT_DOMAIN, NEXT_PUBLIC_SITE_URL
```

## ISR Revalidation Pattern
```
Sanity → Webhook → POST /api/revalidate → revalidateTag('sanity:product') → ISR refresh
Default revalidate: 3600s (1 hour) per fetch
```

## Database (Planned Phase 2)

| Table | Key Fields |
|-------|-----------|
| `User` | id, email, role, tracking_scope_ids |
| `Lead` | id, rfq_data, source_tracking, status |
| `Order` | id, user_id, items, status |
| `Project` | id, name, status, tracking_data |