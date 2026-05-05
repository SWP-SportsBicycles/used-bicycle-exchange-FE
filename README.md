# SBE Marketplace FE (Used Bicycle Exchange)

Frontend MVP for **SBE - Hệ thống mua bán xe đạp thể thao** using a trust-first escrow model.

## Tech Stack

- `Next.js` (App Router, TypeScript)
- `Tailwind CSS`
- `Shadcn-style UI` + `Radix UI`
- `React Query` (Data Fetching & State Management)
- `Zod` + `React Hook Form` (Schema Validation)

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Team Workflow

- Create a feature branch from latest `main` (do not push directly to `main`).
- Keep commits focused and use `type(scope): summary` format.
- Open a PR and complete all checklist items in `.github/pull_request_template.md`.
- Merge only after review approval and all CI checks pass (`guard`, `lint:ci`, `test:ci`, `build`).

See detailed standards:

- `docs/git-workflow.md`
- `docs/fe-team-working-agreement.md`

## Scripts

- `npm run dev` — start local dev server
- `npm run lint` — run ESLint
- `npm run lint:ci` — lint critical architecture paths with zero warnings
- `npm run test` — run unit tests
- `npm run test:ci` — run unit tests for CI
- `npm run build` — production build + typecheck
- `npm run start` — run production server
- `npm run guard` — run repository guardrails

## Architecture Overview

- **Route Groups mapped to Platform Roles**:
  - `src/app/(public)` — Landing, product browse, Product Detail Page (PDP)
  - `src/app/(buyer)` — Buyer portal (Purchases, tracking, disputes)
  - `src/app/(seller)` — Seller dashboard (Listings, revenue, shipments)
  - `src/app/(inspector)` — Inspector portal (Inspection checklists & reports)
  - `src/app/(admin)` — Admin panel (Moderation, dispute resolution, platform fees)
- **Business Rules (`src/lib/domain`)**:
  - `directBuy.ts` — Checkout calculation, platform fees, PayOS integrations mapping
  - `pii.ts` — Seller/Buyer PII reveal policy (Only revealed post-payment process)
  - `orderState.ts` — Advanced order tracking states (Escrow -> Shipping -> Received)
  - `dispute.ts` — Dispute SLA timers & penalty matrix handler
- **API Adapters & Third-Party**:
  - `src/mocks/mockApi.ts` — Mocked data for FE acceleration without waiting for backend
  - `src/lib/api/*` — Query/Mutation hooks (UI should consume these only)
  - Endpoints conceptually prepared for **PayOS** (Payments) and **Giao Hàng Nhanh (GHN)** (Logistics)

## Team Lane Ownership (3 Devs)

### Dev 1 — Lead FE / Core
Owns:
- `src/types/*`
- `src/lib/*` (Auth, API, Domain rules, Integrations prep)
- Core flows: PayOS Checkout UI, GHN webhooks sync, Escrow states

Rules:
- Review PRs touching contracts in `types/lib/mocks`
- Keep query keys + DTO shapes stable

### Dev 2 — Buyer UI/UX
Owns:
- `src/app/(public)/*`
- `src/modules/buyer/*`
- `src/components/shared/*` (presentational only)

Focus:
- Home page conversions, high-performance product filters, responsive & motion polish

### Dev 3 — Dashboards & Forms
Owns:
- `src/app/(seller)/*`
- `src/app/(inspector)/*`
- `src/app/(admin)/*`

Focus:
- Seller listing management + validation
- Inspector checklist/report forms
- Admin moderation hub & dispute center UI

## Branching Strategy (Fast Delivery)

- Main branch: `main` (always buildable)
- Short-lived feature branches:
  - `feat/buyer-browse-pdp`
  - `feat/seller-dashboard`
  - `feat/admin-disputes`
- Small PRs by feature slice; merge early and often.

## Coding Standards

- Component files: `PascalCase.tsx`
- Hooks: `useXxx.ts`
- Use `cn()` from `src/lib/utils/cn.ts` for class merging
- Use `src/components/ui/*` for primitives; avoid custom duplicate base components
- Put business logic in `src/lib/domain/*`, not inside page components

## Mock Data Strategy

Use:
- `src/mocks/mockData.ts` for realistic seed data
- `src/mocks/mockApi.ts` for async mocked endpoints

Covered entities:
- `Listing` (Road/MTB specs, serial numbers, media)
- `Order` (Direct Buy states, Escrow locks, Shipment tracking)
- `Inspection` + `InspectionReport` (Scoring matrices)
- `Dispute` (Evidence attachments, messages)

This allows FE work to unblock completely without backend dependencies.

## Current Core Routes

- `/` — Premium Landing + Trust Signals
- `/bicycles` — Browse with intelligence filters
- `/bicycles/[id]` — Product Detail + *Direct Buy Checkout (PayOS)*
- `/buyer/orders` — Buyer order tracking hub
- `/seller/listings` — Seller inventory table
- `/seller/listings/new` — Validated seller form
- `/inspector/assignments` — Inspector assignments
- `/inspector/inspections/[id]` — Checklist grading
- `/admin/listings/pending` — Listing moderation queue
- `/admin/disputes` — Dispute resolution & SLA helper

## Notes

- Data is currently mocked for MVP FE acceleration.
- Swap to real backend by replacing adapters in `src/lib/api/*` and `src/mocks/mockApi.ts`.
- See `docs/fe-standard-baseline.md` for merge quality baseline and Go/No-Go rules.