# DBSN Centralized Digital Ecosystem

**Author:** Pramono
**Date:** 2026-05-13
**Status:** DRAFT - Production Ready
**Version:** 3.1
**Previous Version:** 3.0

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Evidence](#evidence)
3. [Users](#users)
4. [Hypothesis](#hypothesis)
5. [Success Metrics](#success-metrics)
6. [Scope](#scope)
7. [Delivery Milestones](#delivery-milestones)
8. [Open Questions](#open-questions)
9. [Risks](#risks)
10. [Stakeholders & Governance](#stakeholders--governance)
11. [Support & Operations](#support--operations)

---

## Problem Statement

DBSN's digital presence is fragmented across three independently operated legacy WordPress domains: `pjusolarcellindonesia.com`, `sentradaya.com`, and `alatpenangkalpetir.co.id`. This multi-domain strategy accumulated meaningful keyword-level SEO coverage but has created compounding structural problems that now impede qualified conversion for B2G (government procurement) and B2B (private sector) clients in Indonesia's renewable energy and electrical infrastructure market.

The cost of not solving this problem is three-fold:
1. **Trust Fragmentation:** Government and B2B buyers encountering inconsistent brand footprints cannot form unified vendor confidence signal, directly undermining vendor shortlisting in procurement-critical contexts.
2. **RFQ Drop-Off:** The dominant conversion path is WhatsApp-only with no structured, segmented RFQ capture for product category, project scope, procurement timeline, or buyer segment. This creates invisible drop-off with no recovery mechanism.
3. **Post-RFQ Visibility Gap:** After successful inquiry submission, clients have no secure self-service surface to monitor project or order progression, causing repeated manual status inquiries and increasing operational load on sales/admin teams.

---

## Evidence

- **Internal Strategic Directive:** Company has explicitly prioritized trust signal architecture and conversion infrastructure as the next growth unlock through consolidation.
- **Multi-Site Outgrown:** Operational overhead from managing three separate WordPress sites with siloed content, lead management, and analytics has become unsustainable.
- **Procurement Compliance Requirements:** Government buyers (PPK, Pengadaan, BUMN) must validate SNI/TKDN/LKPP compliance before any engagement, but current sites lack unified certification access.
- **Competitive Pressure:** Intensifying competition in B2B digital channels for renewable and electrical infrastructure requires a more cohesive digital presence.

---

## Users

**Primary Users**

### B2G — Government Procurement Officers
- **Who:** PPK (Pejabat Pembuat Komitmen), Pengadaan staff, and BUMN procurement officers
- **Current Behavior:** They visit multiple legacy domains looking for credentials, certificates, and structured references. They initiate formal RFQ via WhatsApp because no structured form exists. After RFQ submission, they rely on manual follow-up emails and calls for status updates.
- **Trigger:** New procurement project requiring renewable energy or electrical infrastructure suppliers
- **Success State:** Single trusted vendor portal where they can verify compliance credentials, submit structured RFQ, and self-serve track project status without manual follow-up

### B2B — Private Sector Technical Buyers
- **Who:** Procurement managers at private enterprises, EPC project engineers, and facility managers
- **Current Behavior:** They browse multiple legacy sites for product specifications and datasheets. They send WhatsApp messages for inquiries without context about their specific needs. They have no visibility into order status after submission.
- **Trigger:** Sourcing products for renewable energy projects, electrical installations, or facility upgrades
- **Success State:** Efficient research surface with self-service inquiry capability and transparent project tracking

**Not For:**
- End consumers (B2C) — this is a B2G/B2B platform focused on enterprise procurement

---

## Hypothesis

We believe a unified hub-and-spoke platform with segmented RFQ system and authenticated client tracking portal will increase qualified conversion by unifying vendor trust signal and providing self-service status visibility for B2B/B2G clients.

We'll know we're right when:
1. RFQ submission rate shows measurable lift (established baseline post-launch)
2. ≥80% of qualified clients actively use the tracking dashboard for status monitoring
3. Post-migration organic traffic retains ≥70% of combined pre-migration baseline

---

## Success Metrics

| Metric | Target | How Measured |
|---------|--------|---------------|
| Qualified RFQ submissions per month | TBD - requires baseline audit post-launch | Centralized dashboard with source attribution |
| Post-migration organic traffic retention | ≥70% of combined pre-migration baseline | GA4 + GSC + Cloudflare Analytics (Months 1-6) |
| Client dashboard adoption rate | ≥80% of eligible clients | Dashboard auth logs + GA4 tracking events (Months 1-3) |
| PageSpeed Insights mobile score | 90+ on key templates | PSI + Lighthouse CI at launch |
| Hub-to-Spoke CTR & journey completion | Strong routing efficiency per segment path | GA4 pathing + event instrumentation (Months 1-2) |
| LKPP-qualified inquiry rate | Establish & grow stable qualified baseline | RFQ form qualifiers + sales validation (Months 1-3) |
| Certification & datasheet download rate | Continuous growth trend | GA4 file events + CMS analytics (Months 1-3) |
| Lead capture channel attribution | 100% of leads captured with source tags | Dashboard audit at launch |

---

## Scope

**MVP (Minimum Viable Product)**
- Hub root domain (`sentradaya.com`) operational with company profile, certifications hub, portfolio navigation, and spoke CTAs
- At least one product spoke sub-domain operational with product catalog, product detail pages, and segmented RFQ form
- Transactional database (Neon Postgres) receiving and storing leads with source attribution
- Notification pipeline (Resend email + Telegram bot) operational
- Admin dashboard for lead/RFQ management functional
- Basic SEO migration framework with 301 redirect capability

**Out of Scope**
- Phase 2 features: ROI/payback calculator, smart-city capability showcase, advanced product comparison tools
- Advanced analytics: Session replay (PostHog - deferred to Phase 2), detailed funnel analysis
- Multi-language support (Indonesian only for MVP, English considered for Phase 2)

---

## Delivery Milestones

| # | Milestone | Outcome | Status | Plan |
|---|----------|--------|-------|------|
| 1 | Hub & First Spoke Launch | Centralized digital presence with unified trust signal and basic RFQ capture | pending | — |
| 2 | SEO Migration & 301 Redirects | Preserve legacy domain SEO equity, zero unresolved 404s | pending | 1 |
| 3 | Notification Pipeline Operational | Resend + Telegram alerts for new RFQs and failures | pending | 1 |
| 4 | Admin Dashboard & Lead Management | Internal surface for managing RFQs, viewing leads, and assigning tracking access | pending | with 1 |
| 5 | Client Tracking Portal | Authenticated access for qualified clients to view project/order status | pending | 1, 2, 3, 4 |
| 6 | All Spokes Operational | Full product catalog across all sub-domains with consistent design system | pending | 1, 2, 3, 4 |
| 7 | Full Platform Launch | Production deployment with performance targets met and validation complete | pending | 1-6 |

---

## Open Questions

- [ ] What are the specific legal requirements for Indonesian data protection (UU PDP) compliance in this context?
- [ ] Should the platform support both Indonesian and English content from MVP launch, or defer English to Phase 2?
- [ ] What is the expected concurrent user load for RFQ submission during peak campaign periods?

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| SEO migration causes traffic loss >30% | Medium | High | Implement rollback mechanism executable within 4 hours, trigger by >20% 404 rate or critical lead capture failure. Authority: Pramono |
| All notification channels fail simultaneously | Low | High | 3-retry exponential backoff queue. If all channels fail, alert admin/sales team for manual intervention. 0% acceptable lead loss. |
| Legacy WordPress content contains malicious code | Low | High | Sanitize all ingested content before publishing via Next.js (remove malformed HTML, shortcodes, script injections) |
| Dashboard access unauthorized (client sees other clients' data) | Low | Critical | Row-level security via `tracking_scope_ids` JSON array. Clients can only retrieve authorized project/order IDs. Login attempt throttling and audit logging. |
| Performance <90 PSI on key templates | Medium | High | Legacy PSI unoptimized; 90+ target is achievable. Use next/image optimization, lazy loading, and CDN delivery. |

---

## Requirements (MoSCoW Prioritization)

| Priority | Requirement | Rationale | Acceptance Criteria |
|----------|------------|-----------|-----------------|
| P0-Must | Main Hub Trust Platform | Centralized trust center for vendor qualification | Given user navigates to hub root domain, when they click certifications link, then they can view and download SNI/TKDN/LKPP documents. When they click portfolio entries, then they see structured project references with sector filtering. When they click spoke CTAs, then they are navigated to correct subdomain. And navigation completes within 2 seconds. And page renders without layout shift. |
| P0-Must | Product Spoke Sub-domains | Dedicated product spaces with shared codebase | Given user navigates to any spoke subdomain, when they view product catalog, then they see products with filters. When they click a product detail, then they see specs, datasheets, and RFQ form. And content differences are Sanity-driven, not code forks. And design tokens are identical to hub. |
| P0-Must | Segmented RFQ System (B2G + B2B) | Structured RFQ capture with server-side validation | Given user starts filling RFQ form, when they submit valid data, then lead is persisted to Neon Postgres with source attribution. And notification triggers (Resend + Telegram). And they receive confirmation page. When form validation fails, then they see inline field-specific errors. And their entered data is preserved. |
| P0-Must | Graceful Fallback System | No lead lost to technical failure | Given user submits RFQ and API fails, when primary submission attempt fails, then system queues retry with exponential backoff (up to 3 attempts). When all retries fail, then fallback UI renders with pre-filled WhatsApp URL. And admin/sales team receives Telegram failure alert. And user data is preserved. |
| P0-Must | Project Portfolio | First-class navigation feature with structured entries | Given portfolio section exists, when user navigates to it, then they see minimum 20 structured entries with sector filtering. When they filter by sector, then results are correctly filtered. When they click an entry, then they see project details. And related spokes are linked correctly. |
| P0-Must | Centralized Lead & RFQ Data Pipeline | Single source of truth for all inbound leads | Given any RFQ is submitted from any entry point, when data is received, then it writes to Neon Postgres `leads` table with source tags (domain, page path, campaign, UTM parameters). When lead is created, then dashboard reflects near-real-time update. And source attribution is captured 100%. |
| P0-Must | SEO Migration & Redirect System | Preserve accumulated SEO equity | Given a legacy URL is requested, when it has a mapping in `redirect_map` table, then user receives 301 redirect to target URL. When URL has no direct mapping, then fallback chain executes (nearest category → spoke homepage → hub homepage). And zero unresolved 404s occur. |
| P0-Must | Notification Workflow | Operational alerts for new RFQs and failures | Given RFQ submission succeeds, when lead is created, then Resend sends acknowledgment email to submitter. And Resend sends internal notification to sales inbox. And Telegram bot alerts operations channel. When submission fails, then Telegram alerts failure. And fallback is logged. |
| P0-Must | Authenticated Admin Dashboard | Lead/RFQ management surface | Given authenticated admin user logs in, when they access dashboard, then they see lead list with filters, search, and source tags. When they export data, then format is ready for CRM import. And all routes are protected. |
| P0-Must | Authenticated Client Tracking Portal | Self-service project/order status access | Given qualified client is provisioned with dashboard access, when they log in to `dashboard.sentradaya.com`, then they see only their associated project/order tracking statuses. When they attempt to access other clients' data, then access is denied. And login attempts are logged and throttled. |
| P0-Must | SEO Migration Rollback Mechanism | Emergency reversal capability | Given critical failure in lead capture OR >20% 404 error rate occurs, when rollback is triggered by Pramono, then legacy domains are restored to active within 4 hours. And minimal data loss occurs (new leads during window alert manually). And rollback procedure is documented. |
| P0-Must | Cascading Failure Handling | Resilient notification pipeline | Given any notification channel fails, when primary attempt fails, then system queues retry with exponential backoff. When retry count reaches 3, then next channel is attempted. When all channels fail, then admin/sales team receives alert for manual intervention. And failed submissions are queued for recovery. |
| P0-Must | Privacy & Compliance Framework | Data protection for Indonesian clients | Given personal data is collected, when stored, then it is encrypted in transit via TLS. And retained for 3 years (standard B2B/B2G). When deletion is requested, then it requires manual admin approval. And UU PDP compliance is maintained. |
| P1-Should | Documentation Library Expansion | Richer technical content | Not required for MVP launch |
| P1-Should | Product Comparison Tool | Side-by-side comparison | Deferred to Phase 2 |
| P2-Could | ROI Calculator & IoT Showcase | Advanced pre-sales tools | Deferred to Phase 3 |

---

## Stakeholders & Governance

| Role | Name | Authority | Scope |
|------|------|---------|-------|
| Product Owner | Pramono | Sole decision-maker and approver for all gates, sprint validations, and emergency rollback decisions |
| Content Approver | Ibu Mely | Final formal approval for all published content |
| Development Team | Engineering Team | Technical implementation, architecture decisions, code reviews |
| Sales/Operations Team | Internal | End-user support, RFQ follow-up, client onboarding |
| Design Team | Design Team | Design system, UI/UX, visual assets |

**Approval Gates:**
- End of Sprint 1: Signed off by Pramono (Product Owner)
- End of Sprint 2: Signed off by Pramono (Product Owner)
- Pre-Launch Final: Requires leadership presentation and explicit approval from Pramono (Product Owner)
- Emergency Rollback: Immediate decision by Pramono (Product Owner)

---

## Support & Operations

**End-User Support Model**
- Support provider: Internal sales and admin team
- Response SLA: 24 hours for incoming RFQs and support requests
- Escalation path: Critical issues → Pramono (Product Owner) → Emergency rollback if applicable
- Support channels: WhatsApp (for fallback cases), email via Resend, direct admin dashboard for qualified clients

**Post-Launch Monitoring**
- Daily health checks: Core Web Vitals, RFQ submission pipeline, notification delivery
- Weekly review: SEO migration traffic, 404 error rates, conversion metrics
- Monthly business review: Lead conversion trends, dashboard adoption rates, KPI performance against targets

---

## Architecture Overview

The locked architectural model is a **Hub-and-Spoke Sub-domain Architecture** delivered from a **single Next.js 15 application** with middleware-based subdomain routing.

- **Hub:** `sentradaya.com` — Corporate trust center (certifications, portfolio, company info)
- **Product Spokes:** `pju.sentradaya.com`, `solarcell.sentradaya.com`, `alatpetir.sentradaya.com`, `baterai.sentradaya.com` — Product-cluster content and RFQ entry
- **Dashboard:** `dashboard.sentradaya.com` — Authenticated client tracking portal

All subdomains are served from a **single unified Next.js codebase** with a shared design system (Tailwind CSS + Radix UI via shadcn/ui patterns) and a unified data pipeline (Sanity CMS + Neon Postgres via Prisma ORM).

**Tech Stack (Locked):**
- Runtime: Next.js 15 (App Router)
- Package Manager: pnpm
- Content CMS: Sanity.io
- UI System: Tailwind CSS + Radix UI (shadcn/ui patterns)
- Transactional DB: Neon Postgres via Prisma ORM
- Authentication: Auth.js v5
- Hosting: Cloudflare Pages (edge + CDN)
- Notifications: Resend (email) + Telegram Bot API
- Analytics: GA4 + GSC + Cloudflare Analytics
- Phase 2: Sentry (errors) + PostHog (session replay)

---

*Status: DRAFT — Production Ready - Requirements Complete*
*All P0 requirements have testable Given-When-Then acceptance criteria. Baseline metrics marked as TBD require post-launch audit. Rollback and cascading failure handling explicitly defined. Stakeholders and support model documented.*
