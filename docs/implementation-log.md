# Implementation Log (2026-04-20)

## Scope
- Harden auth flow and wire Google OAuth.
- Move FE API traffic to same-origin proxy.
- Align role-based UI access (guard, middleware, menu visibility).
- Modularize seller create-listing screen.

## Implemented

### Auth and API foundation
- Added Google OAuth dependency and conditional provider wiring.
- Changed FE HTTP base to `/api/proxy` with better network-failure handling.
- Added proxy route: `src/app/api/proxy/[...path]/route.ts`.
- Refactored auth context from demo role-switch to real session bootstrap.
- Extended role resolution from multiple backend payload shapes.

### Auth screens
- Unified login/register into tabbed `LoginScreen`.
- Added Google login/register by idToken + role.
- Added pending role hint for register fallback mapping.
- Simplified `RegisterScreen` to wrapper of `LoginScreen`.

### Seller flow
- Extracted create-listing UI to `src/modules/seller/screens/SellerCreateListingScreen.tsx`.
- Reused same screen at `/seller/create` and `/seller/listings/new`.
- Replaced seller listing thumbnail `<img>` with `next/image` on listing page.

### Role-based access
- `RoleGuard` now waits `isInitializing` before redirect checks.
- Middleware now enforces:
  - Auth-required: `/orders`, `/wishlist`, `/profile`.
  - Buyer-only: `/orders`, `/wishlist`.
- Header visibility aligned with access:
  - Buyer sees wishlist/orders.
  - Profile shown for authenticated users.
  - Seller CTA routes guest through seller onboarding.

### Page fallbacks
- `orders`: guest login prompt, non-buyer blocked message.
- `wishlist`: guest login prompt, non-buyer blocked message.
- `profile`: guest login prompt.

### Admin nav cleanup
- Removed dead links to unimplemented `/admin/users` and `/admin/analytics`.

## Validation snapshot
- Type errors on touched files: none.
- Lint: no new blocking errors in touched scope; existing warnings remain in legacy areas.

## Follow-up
- Middleware currently trusts role cookie and does not decode JWT role at edge.
- Final RBAC must still be enforced in backend API.

## Update (2026-04-21)

### Google auth flow hardening
- Refactored Google flow in LoginScreen to support a unified pending state for both login and register intents.
- Added role-confirm step for both Google sign-in and Google sign-up flows before submitting idToken to backend.
- Added pending-state cleanup when switching tabs or canceling role dialog to avoid stale Google token state.
- Updated Google submit pipeline to retry safely: pending state is only cleared on successful submission.

### Seller shipping onboarding gate
- Added seller shipping profile API adapter focused on request DTO shape.
- Added seller shipping profile setup page at /seller/shipping-profile.
- Added seller layout guard to check shipping profile before entering other seller pages; missing profile redirects to shipping setup with redirect back to previous seller route.
- Added seller sidebar item for pickup/shipping profile maintenance.

### Post-login seller routing
- After successful auth session hydration, seller users are checked for shipping profile completeness.
- Seller without profile is redirected to shipping profile setup; non-seller roles keep normal redirect target.

### Validation snapshot
- Type/compile check on touched files: no errors.
- Existing email/password auth flow remains unchanged.
