# FE Standard Baseline

This document defines the minimum architecture and quality bar to merge into `main`.

## 1) Architecture Boundaries

- `src/app/**`:
  - Keep routes thin. Pages/layouts should compose screens/hooks, not own business logic.
- `src/modules/**`:
  - Feature modules own screens, hooks, and feature-level UI.
- `src/lib/api/**`:
  - Centralized HTTP client and domain API adapters.
- `src/lib/domain/**`:
  - Pure domain rules and business calculations.

## 2) Data Flow Rules

- UI must not call `fetch` directly.
- UI must consume Query hooks from module/domain hooks.
- API requests must go through `src/lib/api/http.ts` and domain adapters.

## 3) Security Rules

- Never expose sensitive provider keys in `NEXT_PUBLIC_*`.
- AI and privileged integrations must go through server route handlers (`src/app/api/**`).

## 4) Auth and Route Protection

- Client guard is not enough for sensitive areas.
- Add middleware and/or server checks for role-based access.
- Protected paths include at least:
  - `/admin/**`
  - `/inspector/**`
  - `/seller/**` (except explicitly public parts)

## 5) Quality Gates (Required in CI)

- `npm run guard`
- `npm run lint:ci`
- `npm run test:ci`
- `npm run build`

If one gate fails, the PR is `No-Go`.

## 6) Testing Baseline

- Unit tests for changed domain rules.
- Smoke tests for critical user flows:
  - marketplace browsing
  - seller create listing entry
  - admin/inspector route protection
  - chat client -> server route path
