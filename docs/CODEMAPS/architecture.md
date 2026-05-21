# Architecture Codemap

<!-- Generated: 2026-05-20 | Files scanned: 15 | Token estimate: ~400 -->

## Project Type
**Single App** — Next.js 16 App Router monorepo-ready structure

## System Topology

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare Edge (Planned)                 │
│  Hub: sentradaya.com | Spokes: pju/solar/etc | Dashboard    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                      │
│  Route Groups: (hub), (spokes), (dashboard), (api)          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Data Layer (Planned Phase 2)                                │
│  Sanity.io (CMS) | Neon Postgres + Prisma | Auth.js v5     │
└─────────────────────────────────────────────────────────────┘
```

## Route Groups

| Group | Purpose | Path Prefix |
|-------|---------|-------------|
| `(hub)` | Corporate hub homepage | `/` |
| `(dashboard)` | Client tracking portal | `/tracking`, `/projects` |
| `(spokes)` | Product-specific pages | `/pju/*`, `/solar/*`, etc. |
| `api` | Server endpoints | `/api/*` |

## Key Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/app/(hub)/page.tsx` | Hub homepage | 95 |
| `src/app/(dashboard)/layout.tsx` | Dashboard shell | 24 |
| `src/lib/schema/rfq-schemas.ts` | B2G/B2B RFQ validation | 80 |

## Phase Status

| Phase | Status | Notes |
|-------|--------|-------|
| 1 | **In Progress** | Basic UI components, RFQ schemas |
| 2 | Planned | Sanity CMS, Neon Postgres, Auth.js, Cloudflare |