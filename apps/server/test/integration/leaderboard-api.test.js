import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMemoryScoresStore } from '../../src/leaderboard/memory-store.js';
import { sendRequest, startTestServer } from '../support/test-server.js';

const MINUTE = 60 * 1000;
const RULES = {
  heroes: ['moss', 'bokator'],
  missions: 12,
  difficulties: 3,
  maxPointsPerSecond: 500,
};

let server;
let gamesRoot;
let clock;

async function writeGame(id, extra) {
  const folder = path.join(gamesRoot, id);
  const entry = { id, title: id, tagline: 't', description: 'd', genre: 'g', players: '1' };
  await mkdir(folder, { recursive: true });
  await writeFile(
    path.join(folder, 'game.json'),
    JSON.stringify({ ...entry, cover: 'c.png', ...extra }),
  );
}

beforeEach(async () => {
  gamesRoot = await mkdtemp(path.join(os.tmpdir(), 'arcade-boards-'));
  await writeGame('brawler', { leaderboard: RULES });
  await writeGame('puzzle');
  clock = { time: Date.UTC(2026, 9, 29, 5) };
});

afterEach(async () => {
  await server?.close();
  await rm(gamesRoot, { recursive: true, force: true });
});

async function start(options) {
  const now = () => clock.time;
  const scores = createMemoryScoresStore({ now: () => new Date(clock.time) });
  server = await startTestServer({ gamesRoot, now, scores, ...options });
}

const ownOrigin = () => `http://127.0.0.1:${server.port}`;

function post(pathname, body, headers = {}) {
  const text = body === undefined ? '' : JSON.stringify(body);
  const all = {
    origin: ownOrigin(),
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(text),
    ...headers,
  };
  const sent = Object.fromEntries(Object.entries(all).filter(([, value]) => value !== undefined));
  return sendRequest(server.port, { method: 'POST', path: pathname, headers: sent, body: text });
}

const json = (reply) => JSON.parse(reply.text);
const board = async (game = 'brawler') =>
  sendRequest(server.port, { path: `/api/leaderboard?game=${game}` });

async function ticket() {
  return json(await post('/api/leaderboard/tickets')).ticket;
}

const run = (extra) => ({
  game: 'brawler',
  initials: 'SOK',
  score: 9000,
  mission: 3,
  hero: 'moss',
  difficulty: 1,
  seconds: 290,
  cleared: false,
  ...extra,
});

describe('the leaderboard API', () => {
  it('starts with empty boards for a game that has one, dated by the week in Phnom Penh', async () => {
    await start();
    const reply = await board();
    expect(reply.status).toBe(200);
    expect(json(reply)).toEqual({ weekStart: '2026-10-26', week: [], allTime: [] });
  });

  it.each(['puzzle', 'missing', ''])('has no board for the game %j', async (game) => {
    await start();
    expect((await board(game)).status).toBe(404);
  });

  it('posts a run played since its ticket, ranks it, and shows it on both boards at once', async () => {
    await start();
    await board();
    const runTicket = await ticket();
    clock.time += 5 * MINUTE;
    const reply = await post('/api/leaderboard', run({ ticket: runTicket }));
    expect(reply.status).toBe(201);
    expect(json(reply).rank).toEqual({ week: 1, allTime: 1 });
    expect(json(reply).score).toMatchObject({ initials: 'SOK', score: 9000 });
    const { week, allTime } = json(await board());
    expect(week).toEqual([expect.objectContaining({ initials: 'SOK', date: '2026-10-29' })]);
    expect(allTime).toHaveLength(1);
  });

  it('takes each ticket once', async () => {
    await start();
    const runTicket = await ticket();
    clock.time += 5 * MINUTE;
    expect((await post('/api/leaderboard', run({ ticket: runTicket }))).status).toBe(201);
    const again = await post('/api/leaderboard', run({ ticket: runTicket, initials: 'DAR' }));
    expect(again.status).toBe(409);
    expect(json(await board()).week).toHaveLength(1);
  });

  it('refuses a run that claims more play than has passed since its ticket', async () => {
    await start();
    const runTicket = await ticket();
    clock.time += MINUTE;
    const reply = await post('/api/leaderboard', run({ ticket: runTicket, seconds: 600 }));
    expect(reply.status).toBe(400);
    expect(json(reply).error).toMatch(/faster than the clock/);
  });

  it('refuses a made-up ticket and a score its time could not earn', async () => {
    await start();
    const forged = await post('/api/leaderboard', run({ ticket: `${clock.time}.aaaa.bbbb` }));
    expect(json(forged).error).toMatch(/not one this arcade gave/);
    const runTicket = await ticket();
    clock.time += 5 * MINUTE;
    const greedy = await post('/api/leaderboard', run({ ticket: runTicket, score: 999999 }));
    expect(greedy.status).toBe(400);
    expect(json(await board()).week).toEqual([]);
  });

  it('a new week starts with an empty board, and the run stays all time', async () => {
    await start();
    const runTicket = await ticket();
    clock.time += 5 * MINUTE;
    await post('/api/leaderboard', run({ ticket: runTicket }));
    clock.time += 7 * 24 * 60 * MINUTE;
    const next = json(await board());
    expect(next.weekStart).toBe('2026-11-02');
    expect(next.week).toEqual([]);
    expect(next.allTime).toHaveLength(1);
  });
});

describe('the leaderboard API, guarded', () => {
  it.each([
    ['no Origin', { origin: undefined }],
    ['another site', { origin: 'https://evil.example' }],
    ['a cross-site fetch', { 'sec-fetch-site': 'cross-site' }],
  ])('refuses tickets and scores from %s', async (_label, headers) => {
    await start();
    expect((await post('/api/leaderboard/tickets', undefined, headers)).status).toBe(403);
    expect((await post('/api/leaderboard', run({ ticket: 'x' }), headers)).status).toBe(403);
  });

  it('holds back a visitor over the limits', async () => {
    await start({ limiters: { score: () => false, ticket: () => false } });
    const tickets = await post('/api/leaderboard/tickets');
    expect(tickets.status).toBe(429);
    expect(tickets.headers['retry-after']).toBe('600');
    const scores = await post('/api/leaderboard', run({ ticket: 'x' }));
    expect(scores.status).toBe(429);
  });

  it('takes JSON only, and small', async () => {
    await start();
    const wrongType = await post('/api/leaderboard', run(), { 'content-type': 'text/plain' });
    expect(wrongType.status).toBe(415);
    const tooBig = await post('/api/leaderboard', run({ padding: 'x'.repeat(3000) }));
    expect(tooBig.status).toBe(413);
  });

  it('answers a method it does not take with 405', async () => {
    await start();
    const reply = await sendRequest(server.port, { method: 'DELETE', path: '/api/leaderboard' });
    expect(reply.status).toBe(405);
    expect(reply.headers.allow).toBe('GET, POST, HEAD');
  });

  it('turns SQL away before it reaches the database', async () => {
    await start();
    const sneaky = encodeURIComponent("brawler' OR '1'='1");
    expect(
      (await sendRequest(server.port, { path: `/api/leaderboard?game=${sneaky}` })).status,
    ).toBe(404);
    const runTicket = await ticket();
    clock.time += 5 * MINUTE;
    const drop = "moss'); DROP TABLE scores; --";
    const reply = await post('/api/leaderboard', run({ ticket: runTicket, hero: drop }));
    expect(reply.status).toBe(400);
    expect((await board()).status).toBe(200);
  });

  it('keeps the rules out of the games list', async () => {
    await start();
    const { games } = JSON.parse((await sendRequest(server.port, { path: '/api/games' })).text);
    expect(games.map((game) => game.id)).toEqual(['brawler', 'puzzle']);
    expect(games[0]).not.toHaveProperty('leaderboard');
  });
});
