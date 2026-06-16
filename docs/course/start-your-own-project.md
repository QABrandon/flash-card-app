# Start Your Own Project

Everything you need to recreate this workflow from scratch on any project.
Work top to bottom — each step builds on the last.

---

## 1. Create the repo

Open a new empty folder in VS Code, then initialize git:

```sh
git init
```

> Git is your undo button and the foundation every guardrail builds on.

## 2. Set up CLAUDE.md

Start Claude Code (`claude`), then run the init command so Claude drafts its memory file:

```
/init
```

Open `CLAUDE.md` and replace it with the template below (edit the Stack/Commands/Routes to
match your project). This is what keeps Claude consistent and on-spec:

````md
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

[One-sentence description of your app — what it does and who it's for.]
React + Vite frontend, Express backend (Node ESM). [Database: e.g. SQLite via Sequelize ORM — or remove if not added yet.]

## Commands

```sh
npm run dev          # start both server (port 3001) and client (port 5173) concurrently
npm run dev -w server  # server only
npm run dev -w client  # client only
```

## Structure

```
client/        Vite + React frontend
server/        Express API
  src/app.js   Route handlers
  src/index.js Entry point
  [src/db.js   Sequelize instance + model definitions — add when DB is wired up]
  [src/seed.js Idempotent seed function — add when DB is wired up]
```

## API routes

| Method | Path       | Description  |
| ------ | ---------- | ------------ |
| GET    | /api/ping  | health check |
| [...]  | [...]      | [...]        |

The Vite dev server proxies `/api/*` to `http://localhost:3001`.

## DO NOT MODIFY THIS SECTION WITHOUT ASKING ME

- Every write-plan output must restate coding guidelines and conventions in a "Constraints" section — execute-plan subagents read the plan, not this file.

### Coding guidelines

- Test-first (TDD). Tests come first, always.
- Build production grade code
- Use best practices for readability in React, Express
- Validate frontend inputs. Required fields, types, length limits, basic format checks.
- Write for a junior-to-mid dev. Clear and conventional over clever.
- Use pragmatic error handling
- Write e2e tests for critical paths in the application
- (Optional) Why-comments. Short explanations where they help a beginner.
- Don't tell me what approaches you recommend until I ask for them

### Conventions

- Validation: Zod at the API route boundary (when added).
- ORM: Sequelize with SQLite dialect. Models in `server/src/db.js`. Storage: `server/flashcards.db` (production), `:memory:` (test via `NODE_ENV=test`).
- Tests: Vitest; API routes via Supertest. Test `beforeAll` calls `sequelize.sync({ force: true })` + `seed()`.
- E2E: Playwright, in /e2e (pre-commit for now).
- Errors: Return `{ error: { code, message } }`; 404 for unknown routes/resources.
- Pre-commit: Runs lint + unit + API tests + e2e. Never bypass with --no-verify.
````

## 3. Kick off the project

With CLAUDE.md in place, paste this prompt into Claude Code to scaffold the app:

> Scaffold a full-stack web app as an npm workspace. Keep it simple and readable for a junior-to-mid developer.
>
> **Root workspace** (`package.json`):
> - Workspaces: `client`, `server`
> - `npm run dev` — runs server + client concurrently with `concurrently`
> - Dev dependencies: `concurrently`, `eslint`, `prettier`, `husky`, `lint-staged`, `@playwright/test`
> - `lint-staged` config: run eslint on `**/*.{js,jsx}`
>
> **`client/`** — Vite + React frontend:
> - Dependencies: `react`, `react-dom`, `prop-types`
> - Dev dependencies: `vite`, `@vitejs/plugin-react`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`
> - `vite.config.js`: proxy `/api/*` to `http://localhost:3001`; configure Vitest with `jsdom` environment and a `src/test-setup.js` setup file
> - `src/test-setup.js`: imports `@testing-library/jest-dom`
> - `src/main.jsx` and a minimal `src/App.jsx`
>
> **`server/`** — Express backend (Node ESM), port 3001:
> - Dependencies: `express`, `zod`
> - Dev dependencies: `vitest`, `supertest`
> - `npm run dev` uses `node --watch src/index.js`
> - Split into two files:
>   - `src/app.js` — creates the Express app, registers routes, exports it
>   - `src/index.js` — imports app, calls `app.listen()`
> - One route to start: `GET /api/ping` returning `{ message: "pong" }`
>
> **`e2e/`** — Playwright tests at the root, with a `playwright.config.js`

Run it to confirm both servers start:

```sh
npm run dev
```

Then commit the initial scaffold:

```sh
git add -A
git commit -m "initial commit"
```

## 4. Start building features

Use the marketplace superpowers skills to drive feature work spec-first:

> "brainstorm adding [xyz] feature"

Claude will ask clarifying questions, propose a design, and wait for your approval before writing any code. From there it plans, then executes — spec-first, every time.
