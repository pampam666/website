# Premium UI Porting Implementation Plan

## Overview
Port premium UI sections, styles, and assets from the Z.ai single-page website in `extracted_workspace` to the main Hub-and-Spoke platform.

## Pre-Implementation Analysis

### Styling Strategy
- **Current state**: Root uses Tailwind CSS v4 with minimal globals.css
- **Target state**: Full feature set with custom theme variables, keyframes, and utilities
- **Approach**: Direct replacement of globals.css (v4 compatible)
- **Key additions**:
  - Custom CSS variables using oklch color space
  - Dark mode variants with `@custom-variant dark`
  - Custom keyframes: gradient-shift, float, pulse-dot, shimmer, bounce-down, scroll-hint
  - Custom utilities: scrollbar-hide, card-hover, text-gradient, glass effects, premium-card, card-shine
  - Leaflet map custom styles

### Component Mapping
```
extracted_workspace/src/components/    →  root/src/components/
├── ui/ (30+ primitives)             →  ui/ (merge, replace)
├── theme-toggle.tsx                  →  shared/ThemeToggle.tsx
├── wave-divider.tsx                  →  shared/WaveDivider.tsx
├── scroll-reveal.tsx                  →  shared/ScrollReveal.tsx
├── scroll-progress.tsx                →  shared/ScrollProgress.tsx
├── back-to-top.tsx                    →  shared/BackToTop.tsx
├── page-loader.tsx                    →  shared/PageLoader.tsx
├── cookie-consent.tsx                  →  shared/CookieConsent.tsx
├── activity-toast.tsx                  →  shared/ActivityToast.tsx
└── whatsapp-float.tsx                 →  shared/WhatsAppFloat.tsx

extracted_workspace/src/components/sections/  →  root/src/components/sections/
├── hero-section.tsx                   →  sections/HeroSection.tsx (static)
├── about-section.tsx                   →  sections/AboutSection.tsx (static)
├── certifications-section.tsx          →  sections/CertificationsSection.tsx (dynamic)
├── portfolio-section.tsx               →  sections/PortfolioSection.tsx (dynamic)
├── partners-section.tsx                →  sections/PartnersSection.tsx (static)
├── products-section.tsx                →  sections/ProductsSection.tsx (static)
├── services-section.tsx                →  sections/ServicesSection.tsx (static)
├── testimonials-section.tsx            →  sections/TestimonialsSection.tsx (static)
├── why-choose-section.tsx              →  sections/WhyChooseSection.tsx (static)
├── process-section.tsx                 →  sections/ProcessSection.tsx (static)
├── articles-section.tsx                →  sections/ArticlesSection.tsx (static)
├── rfq-section.tsx                     →  sections/RFQSection.tsx (static)
├── faq-section.tsx                     →  sections/FAQSection.tsx (static)
├── contact-section.tsx                 →  sections/ContactSection.tsx (static)
├── cta-banner.tsx                      →  sections/CTABanner.tsx (static)
├── project-map-section.tsx             →  sections/ProjectMapSection.tsx (static)
└── newsletter-section.tsx              →  sections/NewsletterSection.tsx (static)
```

### Sanity Type Mapping

**CertificationsSection:**
```typescript
// Sanity type
interface Certification {
  _id: string
  title: string
  certType: string
  certificationBody: string
  issueDate: string | null
  expiryDate: string | null
  documentUrl: string | null
  coverImage: any
  isIndexable: boolean
}

// Component prop (after decoupling)
interface Certification {
  id: string
  title: string
  certType: string
  certificationBody: string
  issueDate: string
  expiryDate: string
  description: string | null
}

// Mapping: expiryDate = expiryDate, description = derive from other fields
```

**PortfolioSection:**
```typescript
// Sanity type
interface PortfolioWithRelations {
  _id: string
  title: string
  projectType: string
  clientCategory: string
  location: string
  completionYear: number
  scopeDescription: string
  outcome: string
  images: any[] | null
  relatedSpoke: { _id: string; subdomain: string } | null
  seoMeta?: any
}

// Component prop (after decoupling)
interface PortfolioItem {
  id: string
  title: string
  clientCategory: string
  location: string
  completionYear: number
  scopeDescription: string
  outcome: string
  images: string | null
  relatedSpoke: string | null
  image?: string
}

// Mapping: id = _id, relatedSpoke = relatedSpoke?.subdomain
```

## Implementation Steps

### Step 1: Install Dependencies
```bash
pnpm add framer-motion next-themes embla-carousel-react @radix-ui/react-accordion @radix-ui/react-avatar @radix-ui/react-tooltip tw-animate-css
```

### Step 2: Copy PNG Assets
Copy from `extracted_workspace/public/images/` to `root/public/images/`
- hero-bg.png
- portfolio-petir-building.png
- portfolio-pju-highway.png
- portfolio-solar-rooftop.png
- product-baterai.png
- product-petir.png
- product-pju.png
- product-solar.png

### Step 3: Merge Global Styles
Replace `src/app/globals.css` with extracted workspace version.
- Add `@import "tw-animate-css";` at top
- Add all custom theme variables, keyframes, and utilities
- No conflicts expected as root already uses Tailwind v4

### Step 4: Port UI Components

#### 4.1 Copy Utility Components
Create `src/components/shared/` and copy:
- ScrollReveal.tsx
- ThemeToggle.tsx
- WaveDivider.tsx
- ScrollProgress.tsx
- BackToTop.tsx
- PageLoader.tsx
- CookieConsent.tsx
- ActivityToast.tsx
- WhatsAppFloat.tsx

#### 4.2 Copy/Replace UI Primitives
Replace entire `src/components/ui/` directory with extracted version.
- Ensures all primitives (accordion, avatar, tooltip, sheet, etc.) are available

#### 4.3 Copy Section Components
Create `src/components/sections/` and copy all section files.
- Keep as-is initially (static data hardcoded)

### Step 5: Setup ThemeProvider
In `src/app/layout.tsx`:
1. Import `ThemeProvider` from `next-themes`
2. Import `ThemeToggle` (it will be used by Header)
3. Wrap children with `ThemeProvider`
4. Add `suppressHydrationWarning` prop for SSR compatibility

### Step 6: Decouple Data in Section Components

#### 6.1 CertificationsSection
- Remove hardcoded `certifications` array
- Add props interface:
```typescript
interface CertificationsSectionProps {
  certifications: Certification[]
}
```
- Pass certifications as prop
- Keep status calculation logic (no changes needed)

#### 6.2 PortfolioSection
- Remove hardcoded `portfolioItems` array
- Add props interface:
```typescript
interface PortfolioSectionProps {
  portfolio: PortfolioItem[]
}
```
- Pass portfolio as prop
- Keep filter and dialog logic (no changes needed)

### Step 7: Update Hub Page
In `src/app/(hub)/page.tsx`:
1. Import all new section components
2. Import ScrollReveal and WaveDivider
3. Fetch data from Sanity (already happening)
4. Map Sanity data to component props:
   - Certifications: map directly
   - Portfolio: map `_id` → `id`, `relatedSpoke` → `relatedSpoke?.subdomain`, `images[0]` → `image`
5. Replace existing simple sections with premium versions
6. Maintain existing functionality (links to certification/portfolio pages)

### Step 8: Migrate Prisma Schema

In `prisma/schema.prisma` (create if doesn't exist):
1. Set provider to `postgresql`
2. Add models from extracted (excluding duplicates of Sanity content):
   - Lead (RFQ submissions)
   - User (dashboard access)
   - Article (blog posts)
   - ContactSubmission
   - RedirectMap
   - Newsletter
3. Remove Certification and PortfolioEntry models (Sanity is source of truth)
4. Update `DATABASE_URL` to use PostgreSQL (Neon)

## Verification Steps

### 1. Dependency Installation
```bash
pnpm install
```
Expected: All packages install without errors.

### 2. Type Checking
```bash
npx tsc --noEmit
```
Expected: No TypeScript errors.

### 3. Development Server
```bash
pnpm dev
```
Expected:
- Server starts on port 3000
- Hub page loads with new premium UI
- Theme toggle works
- Certifications and Portfolio display Sanity data
- No console errors

### 4. Visual Verification
- [ ] Dark/light theme toggle works
- [ ] Scroll reveal animations work
- [ ] Wave dividers render correctly
- [ ] Certifications section displays data
- [ ] Portfolio section displays data and filters work
- [ ] Premium card hover effects work
- [ ] Custom scrollbars render

## Notes

1. **Package Manager**: The task specifies `pnpm` but root uses `npm` in package.json scripts. Will use `pnpm add` as specified, but verify npm scripts work correctly.

2. **Sanity as Source of Truth**: Keep Sanity as the primary CMS for products, portfolio, and certifications. Prisma models are for transactional data (leads, users, contacts).

3. **Immutability**: All state updates in components should use immutable patterns (already done in extracted workspace).

4. **Test Coverage**: TDD approach required - write tests before implementation for any new functionality.

5. **No Hardcoded Secrets**: All environment variables should use `.env` format.