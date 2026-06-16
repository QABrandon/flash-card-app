---
name: sqlite-sequelize
description: Replace hardcoded deck/card arrays with a Sequelize-backed SQLite database (read-only)
metadata:
  type: project
---

# SQLite + Sequelize — Read-Only Data Layer

## Goal

Replace the hardcoded `DECKS` and `CARDS` arrays in `server/src/app.js` with a real SQLite database managed by Sequelize. The API surface stays the same. No CRUD routes yet.

## Architecture

### New / changed files

| File | Change |
|------|--------|
| `server/src/db.js` | New — Sequelize instance, model definitions, associations |
| `server/src/seed.js` | New — idempotent seed function (inserts data only when tables are empty) |
| `server/src/app.js` | Replace hardcoded arrays with Sequelize model queries |
| `server/src/index.js` | Call `sequelize.sync()` then `seed()` before `app.listen()` |
| `server/package.json` | Add `sequelize` and `sqlite3` dependencies |
| `.gitignore` | Add `*.db` |

### Database file

`server/flashcards.db` — created automatically on first run. When `NODE_ENV=test`, storage is `:memory:` so tests never touch the file.

## Data Model

```sql
-- decks
id   INTEGER PRIMARY KEY AUTOINCREMENT
name TEXT NOT NULL

-- cards
id      INTEGER PRIMARY KEY AUTOINCREMENT
deck_id INTEGER NOT NULL REFERENCES decks(id)
front   TEXT NOT NULL
back    TEXT NOT NULL
```

Sequelize model names: `Deck`, `Card`. Association: `Deck.hasMany(Card, { foreignKey: 'deckId' })` / `Card.belongsTo(Deck)`.

## API Behaviour

`GET /api/decks` — returns all decks with a live `cardCount` (COUNT query, not a stored column).

`GET /api/decks/:id/cards` — returns cards for the deck. 404 if deck not found. 400 if id is not a positive integer (Zod validation unchanged).

## Seed Data

Same 2 decks and 5 cards currently hardcoded. The `seed()` function checks `Deck.count()` before inserting — safe to call on every startup.

## Testing

- Tests set `NODE_ENV=test` (via Vitest config or the test file itself).
- A `beforeAll` in `cards.test.js` calls `sequelize.sync({ force: true })` then `seed()` to start from a clean, known state.
- Existing assertions are unchanged — the API shape is identical.

## Constraints

- Test-first (TDD). Tests come first, always.
- Build production-grade code.
- Write for a junior-to-mid dev. Clear and conventional over clever.
- Use pragmatic error handling.
- Validation: Zod at the API route boundary (already in place for `:id`).
- Tests: Vitest; API routes via Supertest.
- Errors: `{ error: { code, message } }`; 404 for unknown resources.
- Pre-commit: Runs lint + unit + API tests. Never bypass with --no-verify.
