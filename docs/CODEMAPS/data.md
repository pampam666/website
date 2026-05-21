# Data Codemap

<!-- Generated: 2026-05-20 | Files scanned: 1 | Token estimate: ~250 -->

## Schema Definitions

### RFQ Schemas (`src/lib/schema/rfq-schemas.ts`)

#### Shared Fields
```
contact_name: string (1-255)
contact_email: string (email)
contact_phone: string (+62 format, optional)
company_name: string (1-255, optional)
product_category: string (1-255)
quantity: number (1-100000)
project_scope: string (1-5000, optional)
timeline: YYYY-MM-DD (optional)
notes: string (0-2000, optional)
```

#### B2G Specific
```
segment: "B2G"
procurement_type: Tender Langsung | Tender Umum | Penunjukan Langsung | E-Purchasing
dipa_reference: string (1-255, optional)
```

#### B2B Specific
```
segment: "B2B"
```

#### Source Tracking
```
source_domain: string (1-255)
source_page_path: string (1-512, optional)
source_campaign_tag: string (1-255, optional)
utm_source/medium/campaign: string (1-255, optional)
```

## Database (Planned Phase 2)

### Tables (Neon Postgres + Prisma)
```
User                → id, email, role, tracking_scope_ids
Lead                → id, rfq_data, source_tracking, status
Order               → id, user_id, items, status
Project             → id, name, status, tracking_data
```

### CMS (Sanity.io)
```
Product             → name, category, specifications, images
PortfolioProject    → title, client, location, images, stats
```

## Row-Level Security Pattern
```
users.tracking_scope_ids: JSON array of project/order IDs
Query: WHERE :userId = ANY(tracking_scope_ids)
```