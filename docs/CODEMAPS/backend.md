# Backend Codemap

<!-- Generated: 2026-05-26 | Files scanned: 12 | Token estimate: ~420 -->

## API Routes

```
POST/GET  /api/revalidate   → route.ts → verify webhook secret → revalidateTag()
```

| File | Purpose | Lines |
|------|---------|-------|
| `src/app/api/revalidate/route.ts` | Sanity webhook ISR revalidation | ~120 |
| `src/app/api/revalidate/__tests__route.test.ts` | Route tests | ~250 |

## Middleware Chain (Active)

```
Request → src/middleware.ts (Edge Runtime)
  │
  ├─ Short-circuit: /api/*, /_next/*, /*.ext  → NextResponse.next()
  │
  ├─ cleanHostname(host)   → strips port number
  ├─ isDashboardDomain()   → extractSubdomain() === 'dashboard'
  ├─ isSpokeDomain()       → subdomain in SPOKE_SUBDOMAINS
  │
  ├─ isHubDomain()         → rewrite: x-middleware-subdomain: 'hub'
  ├─ isDashboardDomain()   → rewrite: /dashboard{pathname}
  ├─ isSpokeDomain(spoke)  → rewrite: /{spoke}{pathname}
  └─ unknown               → rewrite: /404
```

## Middleware Config (`src/lib/middleware/config.ts`)

| Function | Signature | Purpose |
|----------|-----------|---------|
| `cleanHostname` | `(host) → string` | Strip port from hostname |
| `isLocalDevelopment` | `(hostname) → boolean` | Detect lvh.me local dev |
| `extractSubdomain` | `(hostname) → string \| null` | Extract subdomain relative to ROOT_DOMAIN |
| `isHubDomain` | `(hostname) → boolean` | Match root / www domain |
| `isDashboardDomain` | `(hostname) → boolean` | Match dashboard subdomain |
| `isSpokeDomain` | `(hostname) → string \| null` | Match pju/solarcell/alatpetir/baterai |

```
SPOKE_SUBDOMAINS = ['pju', 'solarcell', 'alatpetir', 'baterai']
```

## Environment Config (`src/lib/config/env.ts`)

| Schema | Variables | Validator |
|--------|-----------|-----------|
| `sanityEnvSchema` | PROJECT_ID, DATASET, API_VERSION, READ_TOKEN, WRITE_TOKEN, WEBHOOK_SECRET | `validateSanityEnv()` / `getSanityEnv()` |
| `middlewareEnvSchema` | NEXT_PUBLIC_ROOT_DOMAIN, NEXT_PUBLIC_SITE_URL | `validateMiddlewareEnv()` / `getMiddlewareEnv()` |

## Sanity Revalidation Flow

```
Sanity Webhook → POST /api/revalidate
  → verify SANITY_WEBHOOK_SECRET
  → revalidateTag('sanity:*')
  → ISR pages refresh
```

## Planned (Phase 2)

```
POST /api/rfq              → RFQ handler → Sanity/Prisma → Resend + Telegram
GET  /api/tracking/:id     → Auth guard → Prisma RLS
POST /api/auth/[...nextauth] → Auth.js v5
```