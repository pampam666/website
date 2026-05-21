# Frontend Codemap

<!-- Generated: 2026-05-20 | Files scanned: 14 | Token estimate: ~350 -->

## Page Tree

```
src/app/
├── (hub)/page.tsx           → Hub homepage (/)
├── (dashboard)/layout.tsx   → Dashboard shell (/tracking, /projects)
└── (spokes)/                → Product pages (pju, solar, etc.)
    ├── [spoke]/
    └── pju/
```

## Component Hierarchy

```
components/
├── ui/                      → Radix UI primitives
│   ├── button.tsx           → Button with variants (primary, secondary, outline, ghost)
│   ├── dialog.tsx           → Modal/dialog
│   ├── tabs.tsx             → Tab interface
│   ├── select.tsx           → Dropdown select
│   ├── input.tsx            → Text input
│   ├── card.tsx             → Card container
│   └── badge.tsx            → Status badges
├── forms/                   → Form components
│   └── TextField.tsx        → Labeled text field
└── forms/__tests__/         → Form component tests
```

## Utilities

| File | Purpose |
|------|---------|
| `src/lib/utils/cn.ts` | Tailwind class merger (clsx/tailwind-merge) |
| `src/lib/utils/index.ts` | Utility exports |

## State Management
**None configured** — Planned: URL-as-state, React Hook Form

## UI Dependencies

| Package | Purpose |
|---------|---------|
| `@radix-ui/react-slot` | Compound component support |
| `@hookform/resolvers` | React Hook Form + Zod bridge |
| `react-hook-form` | Form state management |
| `tailwindcss` v4 | Utility-first CSS |