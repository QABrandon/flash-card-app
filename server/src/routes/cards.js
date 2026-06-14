import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const CreateCardSchema = z.object({
  front: z.string().min(1, 'front is required').max(1000, 'front must be 1000 characters or fewer'),
  back: z.string().min(1, 'back is required').max(1000, 'back must be 1000 characters or fewer'),
});

const UpdateCardSchema = CreateCardSchema.partial();

const IdSchema = z.coerce.number().int().positive();

// ─── Router factory ──────────────────────────────────────────────────────────

/**
 * Mount this router at /api/decks/:deckId/cards.
 * mergeParams: true is required so :deckId is visible inside this router.
 *
 * @param {import('better-sqlite3').Database} db
 */
export function cardsRouter(db) {
  const router = Router({ mergeParams: true });

  // ── Helpers ────────────────────────────────────────────────────────────────

  function deckExists(deckId) {
    return !!db.prepare('SELECT 1 FROM decks WHERE id = ?').get(deckId);
  }

  function getCard(deckId, cardId) {
    return db.prepare('SELECT * FROM cards WHERE id = ? AND deck_id = ?').get(cardId, deckId);
  }

  function cardNotFound(res) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Card not found' } });
  }

  // ── Routes ─────────────────────────────────────────────────────────────────

  // GET /api/decks/:deckId/cards
  router.get('/', (req, res) => {
    const parsed = IdSchema.safeParse(req.params.deckId);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: { code: 'VALIDATION_ERROR', message: 'deckId must be a positive integer' } });
    }
    if (!deckExists(parsed.data)) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Deck not found' } });
    }

    const cards = db
      .prepare('SELECT * FROM cards WHERE deck_id = ? ORDER BY created_at ASC')
      .all(parsed.data);

    res.json(cards);
  });

  // POST /api/decks/:deckId/cards
  router.post('/', validate(CreateCardSchema), (req, res) => {
    const parsed = IdSchema.safeParse(req.params.deckId);
    if (!parsed.success || !deckExists(parsed.data)) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Deck not found' } });
    }

    const { front, back } = req.body;
    const result = db
      .prepare('INSERT INTO cards (deck_id, front, back) VALUES (?, ?, ?)')
      .run(parsed.data, front, back);

    const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(card);
  });

  // PATCH /api/decks/:deckId/cards/:cardId
  router.patch('/:cardId', validate(UpdateCardSchema), (req, res) => {
    const deckParsed = IdSchema.safeParse(req.params.deckId);
    const cardParsed = IdSchema.safeParse(req.params.cardId);
    if (!deckParsed.success || !cardParsed.success) return cardNotFound(res);

    const card = getCard(deckParsed.data, cardParsed.data);
    if (!card) return cardNotFound(res);

    const front = req.body.front ?? card.front;
    const back = req.body.back ?? card.back;

    db.prepare('UPDATE cards SET front = ?, back = ? WHERE id = ?').run(
      front,
      back,
      cardParsed.data,
    );

    res.json(db.prepare('SELECT * FROM cards WHERE id = ?').get(cardParsed.data));
  });

  // DELETE /api/decks/:deckId/cards/:cardId
  router.delete('/:cardId', (req, res) => {
    const deckParsed = IdSchema.safeParse(req.params.deckId);
    const cardParsed = IdSchema.safeParse(req.params.cardId);
    if (!deckParsed.success || !cardParsed.success) return cardNotFound(res);

    const card = getCard(deckParsed.data, cardParsed.data);
    if (!card) return cardNotFound(res);

    db.prepare('DELETE FROM cards WHERE id = ?').run(cardParsed.data);
    res.status(204).send();
  });

  return router;
}
