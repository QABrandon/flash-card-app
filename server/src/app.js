import express from 'express';
import { decksRouter } from './routes/decks.js';
import { cardsRouter } from './routes/cards.js';

/**
 * Creates and configures the Express application.
 *
 * Accepting the db as a parameter (instead of importing a global) makes the
 * app easy to test: each test suite can pass in a fresh ':memory:' database.
 *
 * @param {import('better-sqlite3').Database} db
 * @returns {import('express').Express}
 */
export function createApp(db) {
  const app = express();

  app.use(express.json());

  // ── Health check ────────────────────────────────────────────────────────────
  app.get('/api/ping', (_req, res) => res.json({ message: 'pong' }));

  // ── Domain routes ───────────────────────────────────────────────────────────
  app.use('/api/decks', decksRouter(db));
  // mergeParams in cardsRouter makes :deckId visible inside it
  app.use('/api/decks/:deckId/cards', cardsRouter(db));

  // ── 404 catch-all ───────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  // ── Error handler ───────────────────────────────────────────────────────────
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    // Log the full error server-side; never send internals to the client
    console.error(err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  });

  return app;
}
