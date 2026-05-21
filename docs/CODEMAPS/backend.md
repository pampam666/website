# Backend Codemap

<!-- Generated: 2026-05-20 | Files scanned: 0 | Token estimate: ~300 -->

## API Routes
**Currently Empty** — Phase 2 implementation pending

## Planned Routes (Phase 2)

```
POST /api/rfq              → RFQ handler → Sanity/Prisma → Resend+Telegram
GET  /api/tracking/:id     → Auth guard → Prisma RLS → Response
POST /api/auth/[...nextauth] → NextAuth v5 session
```

## Middleware Chain (Planned)
```
Request → Subdomain Resolution → Auth Check → Route Handler
```

## Service Layer (Planned)
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   API       │     │   Service   │     │ Repository  │
│  Route      │ ───►│  Business   │ ───►│   Prisma    │
│  Handler    │     │   Logic     │     │   Client    │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Key Dependencies (Planned)
- `@prisma/client` — Neon Postgres ORM
- `@sanity/client` — CMS queries
- `@next-auth/0` — Auth.js v5
- `@resend/node` — Email notifications
- Telegram Bot API — Push notifications