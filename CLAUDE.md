# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DBSN Centralized Digital Ecosystem** — A Next.js 15 hub-and-spoke platform consolidating three legacy WordPress domains into a single codebase with unified design system, CMS, transactional database, and authenticated client tracking portal.

---

## High-Level Architecture

### System Topology

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                     Public (Cloudflare Edge)                      │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                                                │
│  │  Hub: sentradaya.com              Spokes:        Dashboard:         │
│  │  (Corporate Trust)             pju.sentradaya.com     dashboard.sentradaya.com   │
│  │                                  solarcell.sentradaya.com (Secure Tracking) │
│  │                                  alatpetir.sentradaya.com                     │
│  │                                  baterai.sentradaya.com                       │
│  └───────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                                                │
│  │                     Next.js 15 App (Single Codebase)         │
│  │  App Router + Middleware (Subdomain Routing)    │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                                                │
│  │  Hub: sentradaya.com              Spokes:        Dashboard:         │
│  │  (Corporate Trust)             pju.sentradaya.com     dashboard.sentradaya.com   │
│  │                                  solarcell.sentradaya.com (Secure Tracking) │
│  │                                  alatpetir.sentradaya.com                     │
│  │                                  baterai.sentradaya.com                       │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘ │
```

### Tech Stack

| Layer | Technology | Purpose |
|--------|-----------|---------|
| Runtime | Next.js 15 (App Router) | Application framework, routing, middleware |
| Package Manager | pnpm | Dependency management |
| Content CMS | Sanity.io | Headless CMS, product/portfolio data, content federation |
| Transactional DB | Neon Postgres via Prisma ORM | Leads, users, tracking data, redirect mappings |
| Authentication | Auth.js v5 | Session management, RBAC (`admin`, `viewer`, `client`) |
| UI System | Tailwind CSS + Radix UI (shadcn/ui patterns) | Shared design tokens, accessible components |
| Hosting | Cloudflare Pages | Edge delivery, CDN, middleware-based routing, 301 redirects |
| Notifications | Resend (email) + Telegram Bot API | RFQ alerts, failure notifications |
| Analytics | GA4 + GSC + Cloudflare Analytics | Unified telemetry |
| Phase 2 | Sentry (errors) + PostHog (session replay) | Error tracking, user behavior analytics |

### Data Flow Architecture

```
Sanity CMS ──────┐
│                          │
│   Content (Product,      │
│   Portfolio, Page)      │
└─────────────────────────┼────→ Prisma ORM → Neon Postgres
                                       │
                        │
                        ↓
┌─────────────────────────┐   │
│   Auth.js v5          │
│ (Session + RBAC)       │
│        ↓
│  Next.js API Routes   │
└─────────────────────────┘   │
                        │
                        ↓
└─────────────────────────┐   │
│   Cloudflare (301, Hosting, Edge)
└─────────────────────────┘   │
                                      ↓
                              Notifications (Resend + Telegram)
```

---

## Component Structure

```
src/
├── app/
│   ├── (hub)/         # Hub root pages
│   ├── (spokes)/       # Product spoke pages
│   └── (dashboard)/    # Client tracking portal
├── components/
│   ├── ui/            # Radix UI primitives (Button, Dialog, etc.)
│   ├── forms/          # RFQ forms (B2G, B2B variants)
│   └── shared/        # Reusable patterns, utilities
├── lib/
│   ├── api/            # API clients (Sanity, auth, database)
│   ├── db/             # Prisma ORM clients
│   └── config/          # Environment variables, feature flags
└── styles/
    └── globals.css    # Shared Tailwind config (root-level, no local overrides)
```

---

## Development Workflow

### Build & Development
```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Type checking
pnpm type-check

# Production build
pnpm build
```

### Testing
```bash
# Run tests
pnpm test

# E2E tests (Playwright)
pnpm test:e2e

# Test coverage report
pnpm coverage:report
```

### Linting & Code Quality
```bash
# ESLint
pnpm lint

# Prettier (if configured)
pnpm prettier --check .
```

---

## Architecture Key Patterns

### Hub-and-Spoke Routing
- Subdomain resolution happens in middleware before Next.js routing
- Route groups: `(hub)`, `(spokes)`, `(dashboard)`
- Spokes share same route structure and UI components
- Dashboard uses separate route group with authentication guards

### Content Federation (Sanity)
- All product and portfolio data stored in Sanity CMS
- Prisma `Sanity` client queries CMS for product/portfolio lookups in spoke pages
- Content changes trigger webhook-based cache invalidation

### Multi-Tenant Data Access
- Row-level security via `users.tracking_scope_ids` (JSON array of authorized project/order IDs)
- Dashboard users (`role=client`) can only read rows where their user ID is in `tracking_scope_ids`
- Admin users (`role=admin` or `role=viewer`) have full system access

### RFQ Fallback System
- Primary submission via `/api/rfq` endpoint
- On failure (5xx or timeout): retry up to 3 times with exponential backoff
- If all retries fail: render WhatsApp fallback with pre-filled URL parameters
- Send failure alerts via Telegram to sales team

### Authentication Flow
- NextAuth.js v5 for session management
- JWT tokens stored in httpOnly cookies
- Role-based route protection using middleware
- Dashboard sessions enforced via `tracking_scope_ids` authorization check

---

## Key Dependencies

| Dependency | Version | Purpose |
|----------|--------|---------|
| @next-auth/0 | ^21.0.0 | Auth.js v5, session management |
| @prisma/client | ^5.20.0 | Prisma ORM, Neon Postgres client |
| @sanity/client | ^3.35.0 | Sanity CMS client |
| @radix-ui/react-slot | ^1.0.3 | Radix UI primitives |
| @radix-ui/react-dialog | ^1.0.3 | Radix UI dialog components |
| @radix-ui/react-select | ^1.0.3 | Radix UI select components |
| @radix-ui/react-tabs | ^1.0.3 | Radix UI tabs components |
| tailwindcss | ^3.4.0 | Utility-first CSS framework |
| @resend/node | ^3.0.0 | Email API client |
| @supabase/mcp-server | ^0.8.1 | Neon Postgres MCP server |
| @playwright/mcp | ^0.0.75 | Playwright E2E testing |

---

## Environment Variables

Required environment variables must be set before running in application:

| Variable | Description | Sensitivity |
|---------|-----------|----------|
| DATABASE_URL | Neon Postgres connection string | High |
| NEXTAUTH_SECRET | Auth.js v5 secret for JWT signing | High |
| NEXTAUTH_URL | Auth.js v5 provider URL | High |
| SANITY_PROJECT_ID | Sanity CMS project ID | High |
| SANITY_API_READ_TOKEN | Sanity CMS read token | High |
| SANITY_WRITE_TOKEN | Sanity CMS write token | High |
| RESEND_API_KEY | Resend email API key | High |
| TELEGRAM_BOT_TOKEN | Telegram bot API token | High |
| GA_TRACKING_ID | Google Analytics 4 tracking ID | Medium |
| GSC_SERVICE_ACCOUNT_JSON | Google Search Console service account | Medium |
| NODE_ENV | Environment (development, staging, production) | Medium |

---

## Integration Points

When integrating new features or third-party services, follow these integration patterns:

1. **CMS Integration** — Use Prisma `Sanity` client with proper GROQ queries
2. **API Integration** — Implement proper error handling and retry logic
3. **Analytics Integration** — Use GA4 event naming consistent with PRD v3.1
4. **Notification Integration** — Wire both Resend (email) and Telegram for all critical events
5. **WhatsApp Fallback Engine** — Serialize captured RFQ fields to wa.me prefill format
6. **Authentication Integration** — Wire NextAuth route handlers with proper RBAC enforcement
7. **Phase 2 Monitoring** — Integrate Sentry for error tracking and PostHog for session replay

---

## Notes

This is a **hub-and-spoke architecture** — all subdomains run from a single Next.js codebase
- **No code forks** — differentiation is content-driven via Sanity CMS and routing, not separate implementations
- **Shared design system** — Tailwind config at repo root is single source of truth for all UI
- **Mobile-first** — All UI components must be tested on 375px minimum viewport
- **Performance targets** — PSI mobile score 90+ on all key pages is a launch gate requirement

---

*Generated: 2026-05-13*
*Status: Production Ready — Architecture documentation complete*
