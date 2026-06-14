import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const CreateDeckSchema = z.object({
  name: z.string().min(1, 'name is required').max(100, 'name must be 100 characters or fewer'),
  description: z.string().max(500, 'description must be 500 characters or fewer').optional(),
});

// PATCH only requires a subset of fields — both are optional but at least one
// should be sent (we don't enforce that; sending {} is a no-op, not an error)
const UpdateDeckSchema = CreateDeckSchema.partial();

const DeckIdSchema = z.coerce.number().int().positive('id must be a positive integer');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function notFound(res) {
  return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Deck not found' } });
}

// ─── Router factory ──────────────────────────────────────────────────────────

/**
 * @param {import('better-sqlite3').Database} db
 */
export function decksRouter(db) {
  const router = Router();

  // Prepared statements are compiled once and reused — faster than raw strings
  const listDecks = db.prepare(`
    SELECT d.id, d.name, d.description, d.created_at,
           COUNT(c.id) AS cardCount
    FROM   decks d
    LEFT JOIN cards c ON c.deck_id = d.id
    GROUP  BY d.id
    ORDER  BY d.created_at DESC, d.id DESC
  `);

  const getDeck = db.prepare(`
    SELECT d.id, d.name, d.description, d.created_at,
           COUNT(c.id) AS cardCount
    FROM   decks d
    LEFT JOIN cards c ON c.deck_id = d.id
    WHERE  d.id = ?
    GROUP  BY d.id
  `);

  // GET /api/decks
  router.get('/', (_req, res) => {
    res.json(listDecks.all());
  });

  // POST /api/decks
  router.post('/', validate(CreateDeckSchema), (req, res) => {
    const { name, description } = req.body;
    const result = db
      .prepare('INSERT INTO decks (name, description) VALUES (?, ?)')
      .run(name, description ?? null);

    res.status(201).json(getDeck.get(result.lastInsertRowid));
  });

  // GET /api/decks/:id
  router.get('/:id', (req, res) => {
    const parsed = DeckIdSchema.safeParse(req.params.id);
    if (!parsed.success) return notFound(res); // treat bad id as not found

    const deck = getDeck.get(parsed.data);
    if (!deck) return notFound(res);
    res.json(deck);
  });

  // PATCH /api/decks/:id
  router.patch('/:id', validate(UpdateDeckSchema), (req, res) => {
    const parsed = DeckIdSchema.safeParse(req.params.id);
    if (!parsed.success) return notFound(res);

    const current = getDeck.get(parsed.data);
    if (!current) return notFound(res);

    const name = req.body.name ?? current.name;
    // Allow clearing description by sending description: null isn't possible
    // through Zod (it strips undefined), so undefined means "keep existing"
    const description = req.body.description !== undefined ? req.body.description : current.description;

    db.prepare('UPDATE decks SET name = ?, description = ? WHERE id = ?').run(
      name,
      description,
      parsed.data,
    );

    res.json(getDeck.get(parsed.data));
  });

  // DELETE /api/decks/:id
  router.delete('/:id', (req, res) => {
    const parsed = DeckIdSchema.safeParse(req.params.id);
    if (!parsed.success) return notFound(res);

    const deck = getDeck.get(parsed.data);
    if (!deck) return notFound(res);

    db.prepare('DELETE FROM decks WHERE id = ?').run(parsed.data);
    // 204 No Content — success with no body
    res.status(204).send();
  });

  return router;
}
