## Summary
- What problem does this PR solve?
- Why is this approach chosen?

## Scope
- [ ] Phase 1: `src/lib/api/http.ts` + domain APIs + Query hooks
- [ ] Phase 2: Thin route + `modules/*/screens/*`
- [ ] Phase 3: Server-side secret flow via `app/api/*`
- [ ] Phase 4: Route protection via middleware/server checks
- [ ] Phase 5: Tests + CI gates

## Git Workflow Compliance
- [ ] Branch is created from latest `main` and follows naming convention (`feature/*`, `fix/*`, `chore/*`, `docs/*`)
- [ ] PR scope is focused to one primary objective
- [ ] Commit messages follow `type(scope): summary`
- [ ] This PR is not a direct push to `main`
- [ ] Required review approvals are collected before merge
- [ ] Workflow reference checked: `docs/git-workflow.md`

## Go / No-Go Checklist
- [ ] No direct `fetch` in UI components/pages (except Next route handlers and server utilities)
- [ ] Remote state is handled via Query hooks
- [ ] Sensitive keys are not exposed via `NEXT_PUBLIC_*`
- [ ] Protected routes have client + server guard coverage
- [ ] Unit tests updated/added for changed domain behavior
- [ ] Smoke checks performed for critical user paths
- [ ] `npm run guard` passes
- [ ] `npm run lint:ci` passes
- [ ] `npm run test:ci` passes
- [ ] `npm run build` passes

## Test Plan
- [ ] Marketplace page loads and data flow works
- [ ] Seller flow can open create listing page
- [ ] Admin/Inspector routes are blocked for wrong roles
- [ ] Chat endpoint works from client through server route
- [ ] All payments (sandbox/mock) + order flow (UI + state)
- [ ] Login/Auth persistence + profile updates + seller registration

## Risks & Rollback
- Risks:
- Rollback plan:
