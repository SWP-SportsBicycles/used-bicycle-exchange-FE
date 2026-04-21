# Git Workflow Standard

This document defines the required Git flow for all code changes in this repository.

## 1. Core Principles

- `main` must always stay releasable.
- Do not push directly to `main`.
- Every change goes through a pull request.

## 2. Standard Delivery Flow

1. Update local `main`.
2. Create a dedicated branch from `main`.
3. Implement a focused change.
4. Commit with clear messages.
5. Push branch to remote.
6. Open PR to `main`.
7. Wait for required reviews and required checks.
8. Merge only when all gates pass.
9. Sync local `main` after merge.

## 3. Branch Naming

- `feature/<short-topic>`
- `fix/<short-topic>`
- `chore/<short-topic>`
- `docs/<short-topic>`

Examples:

- `feature/auth-google-firebase`
- `fix/checkout-role-guard`
- `docs/readme-setup`

## 4. Commit Message Format

Use:

- `type(scope): short summary`

Recommended types:

- `feat`
- `fix`
- `chore`
- `docs`
- `refactor`
- `test`
- `ci`

Examples:

- `feat(auth): add firebase google sign-in`
- `fix(ci): sync lockfile with package manifest`
- `docs(readme): update setup guide`

## 5. Pull Request Requirements

- PR must have a single clear goal.
- PR description must include problem, approach, risk, and rollback plan.
- UI changes should include screenshots or short recordings.
- If API contract changes, note impact and migration notes.

## 6. Required Quality Gates

Before merge, all must pass:

- `npm run guard`
- `npm run lint:ci`
- `npm run test:ci`
- `npm run build`

## 7. Main Branch Protection Policy

- Block direct push to `main`.
- Require at least 1 approval.
- Require all required checks to pass.
- Require branch to be up-to-date before merge.

## 8. Merge Strategy

- Default: `Squash and merge`.
- Never merge with red checks.
- Avoid self-approval for your own PR.

## 9. Emergency Hotfix

1. Branch from `main` with `hotfix/<topic>`.
2. Open high-priority PR.
3. Keep scope minimal and focused.
4. After release, open follow-up PR if cleanup is needed.

## 10. Prohibited Actions

- No force push to `main`.
- Do not mix unrelated changes in one PR.
- Do not commit secrets or environment credentials.
