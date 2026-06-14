import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { createDb } from '../db.js';

let app;
// The deck we'll use across card tests — recreated fresh each test
let deckId;

beforeEach(async () => {
  app = createApp(createDb(':memory:'));
  // Seed one deck so card tests have something to attach to
  const res = await request(app).post('/api/decks').send({ name: 'Test Deck' });
  deckId = res.body.id;
});

// ─── GET /api/decks/:deckId/cards ─────────────────────────────────────────────

describe('GET /api/decks/:deckId/cards', () => {
  it('returns an empty array for a deck with no cards', async () => {
    const res = await request(app).get(`/api/decks/${deckId}/cards`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns cards for a valid deck id', async () => {
    await request(app).post(`/api/decks/${deckId}/cards`).send({ front: 'Q1', back: 'A1' });
    await request(app).post(`/api/decks/${deckId}/cards`).send({ front: 'Q2', back: 'A2' });

    const res = await request(app).get(`/api/decks/${deckId}/cards`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ front: 'Q1', back: 'A1', deck_id: deckId });
  });

  it('returns 404 for an unknown deck', async () => {
    const res = await request(app).get('/api/decks/999/cards');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 for a non-integer deck id', async () => {
    const res = await request(app).get('/api/decks/abc/cards');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for a negative deck id', async () => {
    const res = await request(app).get('/api/decks/-1/cards');
    expect(res.status).toBe(400);
  });
});

// ─── POST /api/decks/:deckId/cards ────────────────────────────────────────────

describe('POST /api/decks/:deckId/cards', () => {
  it('creates a card in the deck', async () => {
    const res = await request(app)
      .post(`/api/decks/${deckId}/cards`)
      .send({ front: 'What is a closure?', back: 'A function that retains access to its outer scope.' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeTypeOf('number');
    expect(res.body.deck_id).toBe(deckId);
    expect(res.body.front).toBe('What is a closure?');
  });

  it('rejects missing front with 400', async () => {
    const res = await request(app)
      .post(`/api/decks/${deckId}/cards`)
      .send({ back: 'Answer only' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects missing back with 400', async () => {
    const res = await request(app)
      .post(`/api/decks/${deckId}/cards`)
      .send({ front: 'Question only' });
    expect(res.status).toBe(400);
  });

  it('rejects empty front', async () => {
    const res = await request(app)
      .post(`/api/decks/${deckId}/cards`)
      .send({ front: '', back: 'A' });
    expect(res.status).toBe(400);
  });

  it('returns 404 when the deck does not exist', async () => {
    const res = await request(app).post('/api/decks/999/cards').send({ front: 'Q', back: 'A' });
    expect(res.status).toBe(404);
  });
});

// ─── PATCH /api/decks/:deckId/cards/:cardId ───────────────────────────────────

describe('PATCH /api/decks/:deckId/cards/:cardId', () => {
  it('updates the front of a card', async () => {
    const { body: card } = await request(app)
      .post(`/api/decks/${deckId}/cards`)
      .send({ front: 'Old Q', back: 'A' });

    const res = await request(app)
      .patch(`/api/decks/${deckId}/cards/${card.id}`)
      .send({ front: 'New Q' });

    expect(res.status).toBe(200);
    expect(res.body.front).toBe('New Q');
    expect(res.body.back).toBe('A'); // unchanged
  });

  it('returns 404 for an unknown card', async () => {
    const res = await request(app)
      .patch(`/api/decks/${deckId}/cards/999`)
      .send({ front: 'X' });
    expect(res.status).toBe(404);
  });
});

// ─── DELETE /api/decks/:deckId/cards/:cardId ──────────────────────────────────

describe('DELETE /api/decks/:deckId/cards/:cardId', () => {
  it('deletes a card and returns 204', async () => {
    const { body: card } = await request(app)
      .post(`/api/decks/${deckId}/cards`)
      .send({ front: 'Q', back: 'A' });

    const deleteRes = await request(app).delete(`/api/decks/${deckId}/cards/${card.id}`);
    expect(deleteRes.status).toBe(204);

    const getRes = await request(app).get(`/api/decks/${deckId}/cards`);
    expect(getRes.body).toHaveLength(0);
  });

  it('returns 404 for an unknown card', async () => {
    const res = await request(app).delete(`/api/decks/${deckId}/cards/999`);
    expect(res.status).toBe(404);
  });
});
