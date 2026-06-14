import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { createDb } from '../db.js';

// Each describe block shares one fresh in-memory DB.
// beforeEach re-creates the app+db so tests don't share state.
let app;

beforeEach(() => {
  app = createApp(createDb(':memory:'));
});

// ─── GET /api/decks ───────────────────────────────────────────────────────────

describe('GET /api/decks', () => {
  it('returns an empty array when no decks exist', async () => {
    const res = await request(app).get('/api/decks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all decks, most recent first', async () => {
    await request(app).post('/api/decks').send({ name: 'First' });
    await request(app).post('/api/decks').send({ name: 'Second' });

    const res = await request(app).get('/api/decks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    // created_at DESC → Second was inserted after First
    expect(res.body[0].name).toBe('Second');
    expect(res.body[1].name).toBe('First');
  });

  it('includes a cardCount field', async () => {
    const { body: deck } = await request(app).post('/api/decks').send({ name: 'JS' });
    await request(app).post(`/api/decks/${deck.id}/cards`).send({ front: 'Q', back: 'A' });

    const res = await request(app).get('/api/decks');
    expect(res.body[0].cardCount).toBe(1);
  });
});

// ─── POST /api/decks ──────────────────────────────────────────────────────────

describe('POST /api/decks', () => {
  it('creates a deck with name and description', async () => {
    const res = await request(app)
      .post('/api/decks')
      .send({ name: 'JavaScript', description: 'JS fundamentals' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'JavaScript', description: 'JS fundamentals' });
    expect(res.body.id).toBeTypeOf('number');
  });

  it('creates a deck with only a name (description defaults to null)', async () => {
    const res = await request(app).post('/api/decks').send({ name: 'CSS' });
    expect(res.status).toBe(201);
    expect(res.body.description).toBeNull();
  });

  it('rejects missing name with 400', async () => {
    const res = await request(app).post('/api/decks').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects empty name', async () => {
    const res = await request(app).post('/api/decks').send({ name: '' });
    expect(res.status).toBe(400);
  });

  it('rejects name longer than 100 characters', async () => {
    const res = await request(app).post('/api/decks').send({ name: 'a'.repeat(101) });
    expect(res.status).toBe(400);
  });

  it('rejects description longer than 500 characters', async () => {
    const res = await request(app)
      .post('/api/decks')
      .send({ name: 'Valid', description: 'x'.repeat(501) });
    expect(res.status).toBe(400);
  });
});

// ─── GET /api/decks/:id ───────────────────────────────────────────────────────

describe('GET /api/decks/:id', () => {
  it('returns a single deck by id', async () => {
    const { body: created } = await request(app).post('/api/decks').send({ name: 'TypeScript' });

    const res = await request(app).get(`/api/decks/${created.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('TypeScript');
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).get('/api/decks/999');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── PATCH /api/decks/:id ─────────────────────────────────────────────────────

describe('PATCH /api/decks/:id', () => {
  it('updates the deck name', async () => {
    const { body: created } = await request(app).post('/api/decks').send({ name: 'JS' });

    const res = await request(app).patch(`/api/decks/${created.id}`).send({ name: 'JavaScript' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('JavaScript');
  });

  it('keeps existing fields when only sending a partial update', async () => {
    const { body: created } = await request(app)
      .post('/api/decks')
      .send({ name: 'JS', description: 'Keep me' });

    const res = await request(app).patch(`/api/decks/${created.id}`).send({ name: 'JavaScript' });
    expect(res.body.description).toBe('Keep me');
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).patch('/api/decks/999').send({ name: 'X' });
    expect(res.status).toBe(404);
  });
});

// ─── DELETE /api/decks/:id ────────────────────────────────────────────────────

describe('DELETE /api/decks/:id', () => {
  it('deletes a deck and returns 204', async () => {
    const { body: created } = await request(app).post('/api/decks').send({ name: 'To Delete' });

    const deleteRes = await request(app).delete(`/api/decks/${created.id}`);
    expect(deleteRes.status).toBe(204);

    const getRes = await request(app).get(`/api/decks/${created.id}`);
    expect(getRes.status).toBe(404);
  });

  it('also deletes the deck\'s cards (cascade)', async () => {
    const { body: deck } = await request(app).post('/api/decks').send({ name: 'Cascade' });
    await request(app).post(`/api/decks/${deck.id}/cards`).send({ front: 'Q', back: 'A' });

    await request(app).delete(`/api/decks/${deck.id}`);

    // The deck is gone — cards should be gone too (ON DELETE CASCADE)
    const res = await request(app).get(`/api/decks/${deck.id}/cards`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).delete('/api/decks/999');
    expect(res.status).toBe(404);
  });
});
