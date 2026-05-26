# Architecture Codemap

<!-- Generated: 2026-05-26 | Files scanned: 42 | Token estimate: ~500 -->

## Project Type
**Single App** — Next.js 16.2.6 App Router, multi-tenant subdomain routing via Edge Middleware

## System Topology

```
┌──────────────────────────────────────────────────────────────┐
│                   Cloudflare Edge (Planned)                  │
│  Hub: sentradaya.com | Spokes: pju/solar/etc | Dashboard     │
└──────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────┐
│              Next.js 16.2.6 App Router (Edge Middleware)     │
│  src/middleware.ts → cleanHostname() → domain routing        │
│  Route Groups: (hub), (spokes)   Flat routes: dashboard/     │
└──────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ↓                           ↓
┌──────────────────────┐     ┌──────────────────────────────┐
│  Sanity.io CMS       │     │  Static Data Layer           │
│  @sanity/client ^7   │     │  articles.ts (6 articles)    │
│  next-sanity ^12     │     │  rfq-schemas.ts (Zod)        │
│  GROQ queries        │     └──────────────────────────────┘
│  ISR + cache tags    │
└──────────────────────┘
```

## Route Structure

| Route | Type | Domain | Notes |
|-------|------|---------|-------|
| `(hub)/` | Route Group | sentradaya.com | Hub homepage + sub-pages |
| `(hub)/about` | Sub-page | sentradaya.com | |
| `(hub)/articles` | Sub-page | sentradaya.com | + `[slug]` |
| `(hub)/certifications` | Sub-page | sentradaya.com | |
| `(hub)/contact` | Sub-page | sentradaya.com | |
| `(hub)/faq` | Sub-page | sentradaya.com | |
| `(hub)/portfolio` | Sub-page | sentradaya.com | |
| `(hub)/products` | Sub-page | sentradaya.com | |
| `dashboard/` | Flat route | dashboard.sentradaya.com | Rewritten by middleware |
| `(spokes)/pju/` | Route Group | pju.sentradaya.com | |
| `(spokes)/[spoke]/` | Route Group | *.sentradaya.com | Dynamic spokes |
| `api/revalidate/` | API route | any | Sanity webhook ISR |

## Middleware Routing Logic

```
Request → src/middleware.ts
  cleanHostname(host)
  ├── isHubDomain()     → (hub) route group (transparent)
  ├── isDashboardDomain() → rewrite /dashboard/*
  ├── isSpokeDomain()   → rewrite /[spoke]/*
  └── unknown domain    → rewrite /404
```

## Key Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/middleware.ts` | Edge subdomain routing | 97 |
| `src/lib/middleware/config.ts` | Domain helpers (cleanHostname, isHubDomain, etc.) | 110 |
| `src/lib/config/env.ts` | Zod env validation (Sanity + Middleware) | 138 |
| `src/app/(hub)/page.tsx` | Hub homepage | ~95 |
| `src/app/dashboard/layout.tsx` | Dashboard shell | ~30 |
| `src/lib/api/sanity/client.ts` | Sanity client + CACHE_TAGS + ISR | 88 |

## Phase Status

| Phase | Status | Notes |
|-------|--------|-------|
| 1 | **Active** | UI components, routing, Sanity CMS, articles, RFQ schemas |
| 2 | Planned | Neon Postgres, Auth.js v5, full RFQ flow, Cloudflare |