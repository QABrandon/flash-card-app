# Flashcards

Full-stack flashcard app: React front end, Express + SQLite back end.

**Coding guidelines:**

- Test-first (TDD). Tests come first, always. Spend edge-case depth on high-impact paths (core logic, API contracts, user flows); keep trivial tests minimal.
- Validate frontend inputs. Required fields, types, length limits, basic format checks.
- Write for a junior-to-mid dev. Clear and conventional over clever.
- (Optional) Why-comments. Short explanations where they help a beginner.

**Conventions:**

- Validation: Zod at the API route boundary.
- Tests: Vitest; API routes via Supertest on an in-memory SQLite DB.
- E2E: Playwright, in /e2e; runs in pre-commit with lint and unit/API tests.
- Errors: Return { error: { code, message } }; 404 for unknown routes/resources; log internals, never send them.
- Pre-commit: lint-staged (ESLint), server vitest, client vitest, Playwright. Never bypass with --no-verify.
- Dev data: `server/src/seed.js` idempotently seeds sample decks on startup when the DB is empty.
- Deploy: (target + prod env vars — TBD)
- Every write-plan output must restate these in a "Constraints" section — execute-plan subagents read the plan, not this file.
