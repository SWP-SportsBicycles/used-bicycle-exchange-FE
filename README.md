# Used Bicycle Exchange FE

Frontend MVP for **Hệ thống mua bán xe đạp thể thao** using:

- `Next.js` (App Router, TypeScript)
- `Tailwind CSS`
- `Shadcn-style UI` + `Radix UI`
- `React Query`
- `Zod` + `React Hook Form`

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` — start local dev
- `npm run lint` — run ESLint
- `npm run build` — production build + typecheck
- `npm run start` — run production server

## Architecture Overview

- Route groups for parallel delivery:
  - `src/app/(public)` — landing, browse, PDP
  - `src/app/(buyer)` — buyer portal
  - `src/app/(seller)` — seller dashboard
  - `src/app/(inspector)` — inspector portal
  - `src/app/(admin)` — admin panel
- Business rules isolated in `src/lib/domain`:
  - `money.ts` — deposit rule `min(10% * price, 2_000_000)`
  - `pii.ts` — seller PII reveal policy
  - `orderState.ts` — order/listing state helpers
  - `dispute.ts` — dispute SLA + matrix helper
- API adapter pattern:
  - `src/mocks/mockApi.ts` for current mocked backend
  - `src/lib/api/*` query/mutation hooks (UI should consume these only)

## Team Lane Ownership (3 dev)

### Dev 1 — Lead FE / Core (40%)

Owns:

- `src/types/*`
- `src/lib/*` (auth, i18n, api, domain rules)
- `src/mocks/*`
- Core flows: deposit checkout, PII, dispute decisions

Rules:

- Review all PRs touching contracts in `types/lib/mocks`
- Keep query keys + DTO shape stable

### Dev 2 — Buyer UI/UX (30%)

Owns:

- `src/app/(public)/*`
- `src/modules/buyer/*`
- `src/components/shared/*` (presentational only)

Focus:

- Home, browse filters, PDP
- Responsive + motion polish

### Dev 3 — Dashboards & Forms (30%)

Owns:

- `src/app/(seller)/*`
- `src/app/(inspector)/*`
- `src/app/(admin)/*`
- `src/modules/{seller,inspector,admin}/*`

Focus:

- Seller listing management + validation
- Inspector checklist/report
- Admin moderation + disputes

## Branching Strategy (fast delivery)

- Main branch: `main` (always buildable)
- Short-lived branches:
  - `chore/project-base`
  - `feat/buyer-browse-pdp`
  - `feat/seller-inspector-portal`
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

- `Listing` (Road/MTB specs, serial, media)
- `Order` (multiple statuses)
- `Inspection` + `InspectionReport`
- `Dispute` + messages

This allows FE work without waiting for backend.

## Current Demo Routes

- `/` — landing + quick links
- `/bicycles` — browse with filters
- `/bicycles/[id]` — product detail + deposit modal
- `/buyer/orders` — buyer orders
- `/buyer/orders/[orderId]` — PII reveal demo after deposit confirmed
- `/seller/listings` — seller listing table
- `/seller/listings/new` — validated seller form
- `/inspector/assignments` — inspector assignments
- `/inspector/inspections/[id]` — checklist form
- `/admin/listings/pending` — moderation queue
- `/admin/disputes` — disputes + SLA/decision helper

## Notes

- Data is mocked for MVP FE acceleration.
- Swap to real backend by replacing adapters in `src/lib/api/*` and `src/mocks/mockApi.ts`.