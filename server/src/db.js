import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Creates (or opens) a SQLite database and initialises the schema.
 *
 * Pass ':memory:' in tests to get a fresh, isolated in-memory DB per test
 * suite — no cleanup needed and no disk writes.
 *
 * @param {string} filename  Path to the .db file, or ':memory:'
 * @returns {import('better-sqlite3').Database}
 */
export function createDb(filename) {
  // For file-based DBs, make sure the parent directory exists first
  if (filename !== ':memory:') {
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    // WAL mode only makes sense for on-disk files; skip it for in-memory DBs
    const db = new Database(filename);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
    return db;
  }

  const db = new Database(filename);
  // For in-memory DBs (used in tests) skip WAL — it doesn't apply
  db.pragma('foreign_keys = ON');
  initSchema(db);
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS decks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      description TEXT,
      created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS cards (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      deck_id    INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
      front      TEXT    NOT NULL,
      back       TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );
  `);
}

// ── Convenience: the default DB path used by the production server ───────────
// Import this in index.js only. Never import it in tests — use createDb(':memory:')
export const DEFAULT_DB_PATH =
  process.env.DB_PATH ?? path.join(__dirname, '..', 'data', 'flashcards.db');
