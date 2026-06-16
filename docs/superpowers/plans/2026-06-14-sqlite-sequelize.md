# SQLite + Sequelize Data Layer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded `DECKS`/`CARDS` arrays in `server/src/app.js` with a Sequelize-backed SQLite database, keeping the API surface identical.

**Architecture:** A new `db.js` module owns the Sequelize instance and model definitions; `seed.js` inserts starter data on first run. Routes in `app.js` become async and query models. `index.js` calls sync + seed before starting the HTTP server. Tests use an in-memory SQLite database via `NODE_ENV=test`.

**Tech Stack:** Node ESM, Express 4, Sequelize 6, sqlite3, Vitest, Supertest, Zod (unchanged)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `server/src/db.js` | **Create** | Sequelize instance, Deck + Card models, associations |
| `server/src/seed.js` | **Create** | Idempotent seed function — inserts 2 decks + 5 cards if DB is empty |
| `server/src/app.js` | **Modify** | Remove hardcoded arrays; make routes async; query models |
| `server/src/index.js` | **Modify** | Sync DB + seed before `app.listen()` |
| `server/package.json` | **Modify** | Add `sequelize` and `sqlite3` dependencies |
| `server/vitest.config.js` | **Modify** | Set `NODE_ENV=test` so DB uses `:memory:` |
| `server/src/__tests__/cards.test.js` | **Modify** | Add `beforeAll`/`afterAll`; add test for `GET /api/decks` |

---

## Constraints

- Test-first (TDD). Tests come first, always.
- Build production-grade code.
- Write for a junior-to-mid dev. Clear and conventional over clever.
- Use pragmatic error handling.
- Validation: Zod at the API route boundary (already in place for `:id`).
- Tests: Vitest; API routes via Supertest.
- Errors: `{ error: { code, message } }`; 404 for unknown resources.
- Pre-commit: Runs lint + unit + API tests. Never bypass with --no-verify.

---

## Task 1: Install Sequelize and sqlite3

**Files:**
- Modify: `server/package.json`

- [ ] **Step 1: Add dependencies**

  Edit `server/package.json` — add to `"dependencies"`:

  ```json
  "sequelize": "^6.37.5",
  "sqlite3": "^5.1.7"
  ```

  Full `dependencies` block after the edit:

  ```json
  "dependencies": {
    "express": "^4.21.2",
    "sequelize": "^6.37.5",
    "sqlite3": "^5.1.7",
    "zod": "^4.4.3"
  }
  ```

- [ ] **Step 2: Install**

  Run from the repo root (not `server/`):

  ```sh
  npm install -w server
  ```

  Expected: resolves without errors; `node_modules/sequelize` and `node_modules/sqlite3` appear under `server/node_modules` or the workspace root.

- [ ] **Step 3: Commit**

  ```sh
  git add server/package.json package-lock.json
  git commit -m "chore: add sequelize and sqlite3 to server"
  ```

---

## Task 2: Set NODE_ENV=test in Vitest config

**Files:**
- Modify: `server/vitest.config.js`

This makes Sequelize use `:memory:` storage during test runs instead of writing a real file.

- [ ] **Step 1: Update the config**

  Replace the entire contents of `server/vitest.config.js` with:

  ```js
  import { defineConfig } from 'vitest/config';

  export default defineConfig({
    test: {
      environment: 'node',
      env: {
        NODE_ENV: 'test',
      },
    },
  });
  ```

- [ ] **Step 2: Verify existing tests still pass**

  ```sh
  npm test -w server
  ```

  Expected: all 4 tests pass (the hardcoded routes are still in place).

- [ ] **Step 3: Commit**

  ```sh
  git add server/vitest.config.js
  git commit -m "chore: set NODE_ENV=test in vitest config"
  ```

---

## Task 3: Create server/src/db.js

**Files:**
- Create: `server/src/db.js`

This module owns the Sequelize instance and the two model definitions. It is imported by the routes and by tests.

- [ ] **Step 1: Create the file**

  Create `server/src/db.js` with this content:

  ```js
  import { Sequelize, DataTypes } from 'sequelize';
  import path from 'path';
  import { fileURLToPath } from 'url';

  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  // Use an in-memory DB during tests so no file is written to disk.
  const storage =
    process.env.NODE_ENV === 'test'
      ? ':memory:'
      : path.join(__dirname, '../../flashcards.db');

  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: false, // silence SQL output in dev/test
  });

  const Deck = sequelize.define(
    'Deck',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
    },
    { timestamps: false },
  );

  const Card = sequelize.define(
    'Card',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      front: { type: DataTypes.STRING, allowNull: false },
      back: { type: DataTypes.STRING, allowNull: false },
    },
    { timestamps: false },
  );

  // Deck owns many Cards; each Card belongs to one Deck.
  Deck.hasMany(Card, { foreignKey: 'deckId' });
  Card.belongsTo(Deck, { foreignKey: 'deckId' });

  export { sequelize, Deck, Card };
  ```

- [ ] **Step 2: Sanity-check the module loads without errors**

  ```sh
  node --input-type=module <<'EOF'
  import { sequelize, Deck, Card } from './server/src/db.js';
  console.log('ok', Deck.name, Card.name);
  EOF
  ```

  Expected output: `ok Deck Card`

- [ ] **Step 3: Commit**

  ```sh
  git add server/src/db.js
  git commit -m "feat: add Sequelize instance and Deck/Card models"
  ```

---

## Task 4: Create server/src/seed.js

**Files:**
- Create: `server/src/seed.js`

The seed function inserts the same 2 decks and 5 cards that are currently hardcoded. It checks `Deck.count()` first so it is safe to call on every startup.

- [ ] **Step 1: Create the file**

  Create `server/src/seed.js`:

  ```js
  import { Deck, Card } from './db.js';

  export async function seed() {
    // Skip if data already exists — safe to call on every startup.
    if ((await Deck.count()) > 0) return;

    const deck1 = await Deck.create({ name: 'JavaScript Basics' });
    const deck2 = await Deck.create({ name: 'React Hooks' });

    await Card.bulkCreate([
      {
        deckId: deck1.id,
        front: 'What is a closure?',
        back: 'A function that retains access to its outer scope.',
      },
      {
        deckId: deck1.id,
        front: 'What does === do?',
        back: 'Strict equality — checks value and type.',
      },
      {
        deckId: deck1.id,
        front: 'What is hoisting?',
        back: 'Declarations are moved to the top of their scope at parse time.',
      },
      {
        deckId: deck2.id,
        front: 'What does useState return?',
        back: 'A state value and a setter function.',
      },
      {
        deckId: deck2.id,
        front: 'When does useEffect run?',
        back: 'After every render, or only when specified deps change.',
      },
    ]);
  }
  ```

- [ ] **Step 2: Commit**

  ```sh
  git add server/src/seed.js
  git commit -m "feat: add idempotent seed function"
  ```

---

## Task 5: Update cards.test.js — add DB setup and decks test

**Files:**
- Modify: `server/src/__tests__/cards.test.js`

Add `beforeAll`/`afterAll` to wire up the in-memory DB, and add a test for `GET /api/decks` (which currently has no test coverage).

After this task the tests still pass because the routes still use hardcoded data. The DB setup runs but the routes don't use it yet — that's fine.

- [ ] **Step 1: Replace the entire test file**

  ```js
  import { afterAll, beforeAll, describe, expect, it } from 'vitest';
  import request from 'supertest';
  import app from '../app.js';
  import { sequelize } from '../db.js';
  import { seed } from '../seed.js';

  // Create a fresh in-memory DB and seed it before any test runs.
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    await seed();
  });

  // Close the connection so Vitest can exit cleanly.
  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/decks', () => {
    it('returns all decks with a numeric cardCount', async () => {
      const res = await request(app).get('/api/decks');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        cardCount: expect.any(Number),
      });
    });
  });

  describe('GET /api/decks/:id/cards', () => {
    it('returns cards for a valid deck id', async () => {
      const res = await request(app).get('/api/decks/1/cards');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toMatchObject({
        deckId: 1,
        front: expect.any(String),
        back: expect.any(String),
      });
    });

    it('returns 404 for an unknown deck', async () => {
      const res = await request(app).get('/api/decks/999/cards');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('returns 400 for a non-integer id', async () => {
      const res = await request(app).get('/api/decks/abc/cards');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for a negative id', async () => {
      const res = await request(app).get('/api/decks/-1/cards');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
  ```

- [ ] **Step 2: Run tests — expect them to pass**

  ```sh
  npm test -w server
  ```

  Expected: 5 tests pass. (The new decks test passes because the hardcoded route returns `cardCount: 3` which is `any(Number)`.)

- [ ] **Step 3: Commit**

  ```sh
  git add server/src/__tests__/cards.test.js
  git commit -m "test: wire DB setup into tests; add GET /api/decks test"
  ```

---

## Task 6: Update app.js — replace hardcoded arrays with Sequelize queries

**Files:**
- Modify: `server/src/app.js`

Remove the hardcoded arrays. Make both list routes `async`. Query the DB via the Sequelize models. Tests will go **red** the moment the arrays are removed, and **green** once the queries are in place — don't commit in between.

- [ ] **Step 1: Confirm tests pass before touching app.js**

  ```sh
  npm test -w server
  ```

  Expected: 5 tests pass.

- [ ] **Step 2: Replace the entire contents of server/src/app.js**

  ```js
  import express from 'express';
  import { z } from 'zod';
  import { sequelize, Deck, Card } from './db.js';

  const DeckIdSchema = z.coerce.number().int().positive();

  const app = express();

  app.get('/api/ping', (req, res) => {
    res.json({ message: 'pong' });
  });

  app.get('/api/decks', async (req, res) => {
    try {
      const rows = await Deck.findAll({
        attributes: [
          'id',
          'name',
          // COUNT with a LEFT JOIN so decks with 0 cards return cardCount: 0
          [
            sequelize.cast(
              sequelize.fn('COUNT', sequelize.col('Cards.id')),
              'INTEGER',
            ),
            'cardCount',
          ],
        ],
        include: [{ model: Card, attributes: [], required: false }],
        group: ['Deck.id'],
        raw: true,
      });
      res.json(rows);
    } catch {
      res
        .status(500)
        .json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch decks' } });
    }
  });

  app.get('/api/decks/:id/cards', async (req, res) => {
    const result = DeckIdSchema.safeParse(req.params.id);
    if (!result.success) {
      return res
        .status(400)
        .json({ error: { code: 'VALIDATION_ERROR', message: 'id must be a positive integer' } });
    }
    try {
      const deck = await Deck.findByPk(result.data);
      if (!deck) {
        return res
          .status(404)
          .json({ error: { code: 'NOT_FOUND', message: 'Deck not found' } });
      }
      const cards = await Card.findAll({ where: { deckId: result.data }, raw: true });
      res.json(cards);
    } catch {
      res
        .status(500)
        .json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch cards' } });
    }
  });

  export default app;
  ```

- [ ] **Step 3: Run tests — all 5 must pass**

  ```sh
  npm test -w server
  ```

  Expected: 5 tests pass. If any fail, check that `db.js` and `seed.js` are importable and that `beforeAll` in the test file is running before the assertions.

- [ ] **Step 4: Commit**

  ```sh
  git add server/src/app.js
  git commit -m "feat: replace hardcoded arrays with Sequelize queries"
  ```

---

## Task 7: Update index.js — sync and seed on startup

**Files:**
- Modify: `server/src/index.js`

The HTTP server must wait for the DB to be ready before accepting requests.

- [ ] **Step 1: Replace the entire contents of server/src/index.js**

  ```js
  import app from './app.js';
  import { sequelize } from './db.js';
  import { seed } from './seed.js';

  const PORT = process.env.PORT ?? 3001;

  // Ensure tables exist, then seed if the DB is empty.
  await sequelize.sync();
  await seed();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  ```

- [ ] **Step 2: Smoke-test the server starts correctly**

  In one terminal:
  ```sh
  npm run dev -w server
  ```

  Expected output includes:
  ```
  Server running on http://localhost:3001
  ```

  In a second terminal:
  ```sh
  curl http://localhost:3001/api/decks
  ```

  Expected: JSON array with 2 deck objects, each with `id`, `name`, and `cardCount`.

  ```sh
  curl http://localhost:3001/api/decks/1/cards
  ```

  Expected: JSON array with 3 card objects for the JavaScript Basics deck.

  Stop the server (`Ctrl+C`) before committing.

- [ ] **Step 3: Run the full test suite one more time**

  ```sh
  npm test -w server
  ```

  Expected: 5 tests pass.

- [ ] **Step 4: Commit**

  ```sh
  git add server/src/index.js
  git commit -m "feat: sync DB and seed on server startup"
  ```

---

## Task 8: Pre-commit hook check

The pre-commit hook runs lint + unit + API tests. Verify it passes cleanly on an empty commit attempt.

- [ ] **Step 1: Run the checks the hook would run**

  ```sh
  npm run lint && npm test -w server
  ```

  Expected: lint clean, 5 tests pass.

- [ ] **Step 2: (Optional) Confirm flashcards.db is not tracked**

  ```sh
  git status
  ```

  `server/flashcards.db` should NOT appear — it is covered by the `*.db` entry already in `.gitignore`.
