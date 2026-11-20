import { TokenVerifier } from 'livekit-server-sdk';
import { afterEach, describe, expect, it } from 'vitest';
import { createLiveServer } from '../../src/create-live-server.js';

const SITE = 'https://morodokangkor.com';
const GAME = 'morodok-angkor';
const config = {
  origins: [SITE],
  games: [GAME],
  trustProxy: false,
  voice: {
    url: 'wss://voice.example.test',
    apiKey: 'APItest',
    apiSecret: 'a-test-secret-that-is-long-enough-for-hs256-0123456789',
    roomPrefix: '',
  },
};
const ids = ['player-0000', 'player-0001', 'player-0002'];
let running;

async function startLive() {
  const calls = [];
  const roomService = {
    createRoom: async (options) => calls.push(['create', options.name]),
    removeParticipant: async (room, identity) => calls.push(['remove', room, identity]),
  };
  const server = createLiveServer({ config, roomService, logError: () => {} });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  running = server;
  const base = `http://127.0.0.1:${server.address().port}`;

  async function post(path, body, origin = SITE) {
    const response = await fetch(base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: origin },
      body: JSON.stringify({ game: GAME, ...body }),
    });

    return { status: response.status, body: await response.json(), headers: response.headers };
  }

  return { post, calls, base };
}

afterEach(() => running?.close());

describe('the live service over HTTP', () => {
  it('makes a party, lets a friend join by code and gives each a ticket for its room', async () => {
    const { post, calls } = await startLive();
    const made = await post('/api/party/make', { playerId: ids[0], name: 'Dara' });
    const code = made.body.code;
    const joined = await post('/api/party/join', {
      code: code.toLowerCase(),
      playerId: ids[1],
      name: 'Vanna',
    });
    const ticket = await post('/api/voice/ticket', {
      code,
      playerId: ids[1],
      key: joined.body.key,
    });
    const claims = await new TokenVerifier(config.voice.apiKey, config.voice.apiSecret).verify(
      ticket.body.token,
    );

    expect(made.status).toBe(200);
    expect(made.headers.get('access-control-allow-origin')).toBe(SITE);
    expect(joined.body.members.map((member) => member.name)).toEqual(['Dara', 'Vanna']);
    expect(ticket.body.room).toBe(`${GAME}-party-${code}`);
    expect(claims.sub).toBe(ids[1]);
    expect(calls).toEqual([['create', `${GAME}-party-${code}`]]);
  });

  it('gives no ticket to someone without the key', async () => {
    const { post } = await startLive();
    const made = await post('/api/party/make', { playerId: ids[0], name: 'Dara' });
    const stranger = await post('/api/voice/ticket', {
      code: made.body.code,
      playerId: ids[2],
      key: made.body.key,
    });

    expect(stranger.status).toBe(403);
    expect(stranger.body).toEqual({ error: 'not-member' });
  });

  it('drops a removed member from voice and gives them no ticket after', async () => {
    const { post, calls } = await startLive();
    const made = await post('/api/party/make', { playerId: ids[0], name: 'Dara' });
    const code = made.body.code;
    const joined = await post('/api/party/join', { code, playerId: ids[1], name: 'Vanna' });
    const removed = await post('/api/party/remove', {
      code,
      playerId: ids[0],
      key: made.body.key,
      target: ids[1],
    });
    const after = await post('/api/voice/ticket', { code, playerId: ids[1], key: joined.body.key });

    expect(removed.body.members).toHaveLength(1);
    expect(calls.at(-1)).toEqual(['remove', `${GAME}-party-${code}`, ids[1]]);
    expect(after.status).toBe(403);
  });

  it('refuses another site, unknown games and floods', async () => {
    const { post } = await startLive();
    const other = await post(
      '/api/party/make',
      { playerId: ids[0], name: 'Dara' },
      'https://evil.example',
    );
    const unknown = await post('/api/party/make', { game: 'nope', playerId: ids[0], name: 'Dara' });
    const answers = [];
    for (let i = 0; i < 7; i++) {
      answers.push((await post('/api/party/make', { playerId: ids[0], name: 'Dara' })).status);
    }

    expect(other.status).toBe(403);
    expect(other.headers.get('access-control-allow-origin')).toBeNull();
    expect(unknown.body).toEqual({ error: 'bad-game' });
    expect(answers.at(-1)).toBe(429);
  });

  it('answers its health check, a preflight, and nothing else', async () => {
    const { base } = await startLive();
    const health = await fetch(`${base}/api/health`);
    const preflight = await fetch(`${base}/api/party/make`, {
      method: 'OPTIONS',
      headers: { Origin: SITE },
    });
    const elsewhere = await fetch(`${base}/api/party/make`);

    expect(await health.json()).toEqual({ ok: true, parties: 0 });
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get('access-control-allow-methods')).toContain('POST');
    expect(elsewhere.status).toBe(404);
  });

  it('answers a broken body with a word, not a crash', async () => {
    const { base } = await startLive();
    const response = await fetch(`${base}/api/party/make`, {
      method: 'POST',
      headers: { Origin: SITE },
      body: '{not json',
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'bad-json' });
  });
});
