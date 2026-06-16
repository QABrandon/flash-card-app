/**
 * Inserts starter decks and cards when the database is empty.
 * Safe to call on every server startup — skips if decks already exist.
 *
 * @param {import('better-sqlite3').Database} db
 */
export function seed(db) {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM decks').get();
  if (count > 0) return;

  const insertDeck = db.prepare('INSERT INTO decks (name) VALUES (?)');
  const insertCard = db.prepare(
    'INSERT INTO cards (deck_id, front, back) VALUES (?, ?, ?)'
  );

  const deck1Id = insertDeck.run('JavaScript Basics').lastInsertRowid;
  const deck2Id = insertDeck.run('React Hooks').lastInsertRowid;

  const seedCards = db.transaction(() => {
    insertCard.run(
      deck1Id,
      'What is a closure?',
      'A function that retains access to its outer scope.'
    );
    insertCard.run(deck1Id, 'What does === do?', 'Strict equality — checks value and type.');
    insertCard.run(
      deck1Id,
      'What is hoisting?',
      'Declarations are moved to the top of their scope at parse time.'
    );
    insertCard.run(
      deck2Id,
      'What does useState return?',
      'A state value and a setter function.'
    );
    insertCard.run(
      deck2Id,
      'When does useEffect run?',
      'After every render, or only when specified deps change.'
    );
  });

  seedCards();
}
