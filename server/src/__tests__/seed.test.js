import { describe, it, expect } from 'vitest';
import { createDb } from '../db.js';
import { seed } from '../seed.js';

describe('seed', () => {
  it('inserts sample decks and cards into an empty database', () => {
    const db = createDb(':memory:');
    seed(db);

    const deckCount = db.prepare('SELECT COUNT(*) AS count FROM decks').get().count;
    const cardCount = db.prepare('SELECT COUNT(*) AS count FROM cards').get().count;

    expect(deckCount).toBe(2);
    expect(cardCount).toBe(5);

    const deckNames = db.prepare('SELECT name FROM decks ORDER BY id').all().map((row) => row.name);
    expect(deckNames).toEqual(['JavaScript Basics', 'React Hooks']);
  });

  it('is idempotent — does not duplicate data when called again', () => {
    const db = createDb(':memory:');
    seed(db);
    seed(db);

    const deckCount = db.prepare('SELECT COUNT(*) AS count FROM decks').get().count;
    const cardCount = db.prepare('SELECT COUNT(*) AS count FROM cards').get().count;

    expect(deckCount).toBe(2);
    expect(cardCount).toBe(5);
  });
});
