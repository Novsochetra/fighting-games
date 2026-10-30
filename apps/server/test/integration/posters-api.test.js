import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMemoryScoresStore } from '../../src/leaderboard/memory-store.js';
import { fakeJpeg, posterImages } from '../support/poster-images.js';
import { sendRequest, startTestServer } from '../support/test-server.js';

const MINUTE = 60 * 1000;
const RULES = {
  heroes: [{ id: 'moss', name: 'Moss Shade' }],
  missions: 12,
  difficulties: ['Easy', 'Normal', 'Hard'],
  maxPointsPerSecond: 500,
};
const FILES_URL = 'https://files.example.test';

let server;
let gamesRoot;
let clock;
let bucket;

function fakeStorage() {
  bucket = new Map();
  const urlOf = (key) => `${FILES_URL}/${key}`;
  return {
    urlOf,
    async putFile({ key, body, contentType }) {
      bucket.set(key, { body, contentType });
      return { key, url: urlOf(key) };
    },
  };
}

beforeEach(async () => {
  gamesRoot = await mkdtemp(path.join(os.tmpdir(), 'arcade-posters-'));
  const folder = path.join(gamesRoot, 'brawler');
  const entry = { id: 'brawler', title: 'B', tagline: 't', description: 'd', genre: 'g' };
  await mkdir(folder, { recursive: true });
  await writeFile(
    path.join(folder, 'game.json'),
    JSON.stringify({ ...entry, players: '1', cover: 'c.png', leaderboard: RULES }),
  );
  clock = { time: Date.UTC(2026, 9, 29, 5) };
});

afterEach(async () => {
  await server?.close();
  await rm(gamesRoot, { recursive: true, force: true });
});

async function start({ storage = fakeStorage(), ...options } = {}) {
  const scores = createMemoryScoresStore({ now: () => new Date(clock.time) });
  server = await startTestServer({ gamesRoot, now: () => clock.time, scores, storage, ...options });
}

function post(pathname, body, headers = {}) {
  const text = JSON.stringify(body ?? {});
  const all = {
    origin: `http://127.0.0.1:${server.port}`,
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(text),
    ...headers,
  };
  const sent = Object.fromEntries(Object.entries(all).filter(([, value]) => value !== undefined));
  return sendRequest(server.port, { method: 'POST', path: pathname, headers: sent, body: text });
}

const json = (reply) => JSON.parse(reply.text);
const boardRuns = async () =>
  json(await sendRequest(server.port, { path: '/api/leaderboard?game=brawler' })).week;
const sendPoster = (ticket, extra) =>
  post('/api/leaderboard/posters', { game: 'brawler', ticket, images: posterImages(), ...extra });

async function postedRun() {
  const { ticket } = json(await post('/api/leaderboard/tickets'));
  clock.time += 5 * MINUTE;
  const run = { name: 'Sok Dara', score: 9000, mission: 3, hero: 'moss', difficulty: 1 };
  const reply = await post('/api/leaderboard', {
    game: 'brawler',
    ...run,
    seconds: 290,
    cleared: false,
    ticket,
  });
  expect(reply.status).toBe(201);
  return ticket;
}

describe('a run poster', () => {
  it('goes up in every size with the ticket that posted its run, and shows on the board', async () => {
    await start();
    const ticket = await postedRun();
    expect((await boardRuns())[0].poster).toBeNull();
    const reply = await sendPoster(ticket);
    expect(reply.status).toBe(201);
    const { poster } = json(reply);
    expect(poster.avatar).toMatch(
      /^https:\/\/files\.example\.test\/posters\/brawler\/\w+-192\.jpg$/,
    );
    expect(poster.images.map((image) => image.width)).toEqual([640, 1200]);
    expect((await boardRuns())[0].poster).toEqual(poster);
    const types = [...bucket.values()].map((file) => file.contentType);
    expect(types).toEqual(['image/jpeg', 'image/jpeg', 'image/png']);
  });

  it('is taken once for a run, and only soon after it is posted', async () => {
    await start();
    const ticket = await postedRun();
    expect((await sendPoster(ticket)).status).toBe(201);
    expect((await sendPoster(ticket)).status).toBe(409);
    const late = await postedRun();
    clock.time += 11 * MINUTE;
    expect((await sendPoster(late)).status).toBe(409);
    expect(bucket.size).toBe(3);
  });

  it('needs a run posted with its ticket, a ticket the arcade gave, and a poster the game drew', async () => {
    await start();
    const { ticket: unposted } = json(await post('/api/leaderboard/tickets'));
    expect((await sendPoster(unposted)).status).toBe(409);
    const forged = await sendPoster(`${clock.time}.aaaaaaaaaaaaaaaa.${'b'.repeat(43)}`);
    expect(json(forged).error).toMatch(/not one this arcade gave/);
    const ticket = await postedRun();
    const drawn = posterImages({ large: fakeJpeg(1200, 630).toString('base64') });
    expect((await sendPoster(ticket, { images: drawn })).status).toBe(400);
    expect(bucket.size).toBe(0);
    expect((await boardRuns())[0].poster).toBeNull();
  });

  it('is turned away while the arcade keeps no files', async () => {
    await start({ storage: null });
    const ticket = await postedRun();
    expect((await sendPoster(ticket)).status).toBe(404);
    expect((await boardRuns())[0].poster).toBeNull();
  });
});

describe('the posters API, guarded', () => {
  it('takes posters only from the arcade’s own pages', async () => {
    await start();
    const reply = await post('/api/leaderboard/posters', {}, { origin: 'https://evil.example' });
    expect(reply.status).toBe(403);
  });

  it('holds back a visitor over the limit before reading what they send', async () => {
    await start({ limiters: { poster: () => false } });
    const reply = await post('/api/leaderboard/posters', { padding: 'x'.repeat(2_000_000) });
    expect(reply.status).toBe(429);
    expect(reply.headers['retry-after']).toBe('600');
  });

  it('takes no more than three sizes of one poster weigh', async () => {
    await start();
    const reply = await post('/api/leaderboard/posters', { padding: 'x'.repeat(1_000_000) });
    expect(reply.status).toBe(413);
  });
});
