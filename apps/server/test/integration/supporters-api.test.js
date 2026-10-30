import { afterEach, describe, expect, it } from 'vitest';
import { MAX_BODY_BYTES } from '../../src/http/read-json-body.js';
import { GIFT_LIMIT } from '../../src/routes/supporters-api.js';
import { sendRequest, startTestServer } from '../support/test-server.js';

let server;

afterEach(() => server?.close());

async function start(options) {
  server = await startTestServer(options);
  return server;
}

const ownOrigin = () => `http://127.0.0.1:${server.port}`;

// A header set to undefined is left out, as a script outside a browser would.
function give(body, headers = {}) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  const all = {
    origin: ownOrigin(),
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(text),
    ...headers,
  };
  const sent = Object.fromEntries(Object.entries(all).filter(([, value]) => value !== undefined));
  return sendRequest(server.port, {
    method: 'POST',
    path: '/api/supporters',
    headers: sent,
    body: text,
  });
}

const list = async (headers) => {
  const reply = await sendRequest(server.port, { path: '/api/supporters', headers });
  return { ...reply, json: reply.status === 200 ? JSON.parse(reply.text) : null };
};

describe('the supporters API', () => {
  it('starts empty, saves a gift from the arcade page, and lists it', async () => {
    await start();
    expect((await list()).json).toEqual({ currency: 'USD', supporters: [] });

    const reply = await give({ name: ' Sok Dara ', amount: 25, message: 'Keep it free!' });
    expect(reply.status).toBe(201);
    expect(JSON.parse(reply.text).supporter).toMatchObject({
      name: 'Sok Dara',
      amount: 25,
      tier: 'diamond',
    });

    const { json } = await list({ 'sec-fetch-site': 'same-origin' });
    expect(json.supporters).toEqual([
      expect.objectContaining({
        name: 'Sok Dara',
        amount: 25,
        tier: 'diamond',
        message: 'Keep it free!',
      }),
    ]);
    expect(json.supporters[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('refuses a gift without an Origin, as only scripts outside a browser send it', async () => {
    await start();
    const reply = await give({ amount: 5 }, { origin: undefined });
    expect(reply.status).toBe(403);
    expect(JSON.parse(reply.text).error).toMatch(/Only the arcade/);
  });

  it.each([
    ['another site', { origin: 'https://evil.example' }],
    ['a cross-site fetch', { 'sec-fetch-site': 'cross-site' }],
  ])('refuses %s, for reads and gifts alike', async (_label, headers) => {
    await start();
    expect((await list(headers)).status).toBe(403);
    expect((await give({ amount: 5 }, headers)).status).toBe(403);
    expect((await list()).json.supporters).toEqual([]);
  });

  it('answers a CORS preflight with 405 and no CORS headers', async () => {
    await start();
    const reply = await sendRequest(server.port, {
      method: 'OPTIONS',
      path: '/api/supporters',
      headers: { origin: 'https://evil.example', 'access-control-request-method': 'POST' },
    });
    expect(reply.status).toBe(405);
    expect(reply.headers.allow).toBe('GET, POST, HEAD');
    expect(reply.headers['access-control-allow-origin']).toBeUndefined();
  });

  it.each([
    ['text that is not JSON', '{"amount":', {}, 400],
    ['a body that is not JSON', 'amount=5', { 'content-type': 'text/plain' }, 415],
    ['a body over the limit', JSON.stringify({ message: 'x'.repeat(MAX_BODY_BYTES) }), {}, 413],
    [
      'a body without a length',
      '{"amount":5}',
      { 'content-length': undefined, 'transfer-encoding': 'chunked' },
      411,
    ],
  ])('refuses %s', async (_label, body, headers, status) => {
    await start();
    const reply = await give(body, headers);
    expect(reply.status).toBe(status);
    expect(JSON.parse(reply.text).error).toEqual(expect.any(String));
  });

  it('says what is wrong with a gift it cannot take', async () => {
    await start();
    const reply = await give({ amount: 0 });
    expect(reply.status).toBe(400);
    expect(JSON.parse(reply.text).error).toMatch(/from \$0\.01 to \$10000/);
  });

  it('takes a gift under a dollar as Bronze', async () => {
    await start();
    const reply = await give({ amount: 0.5 });
    expect(reply.status).toBe(201);
    expect(JSON.parse(reply.text).supporter).toMatchObject({ amount: 0.5, tier: 'bronze' });
  });

  it('holds back a burst of gifts from one address', async () => {
    await start();
    for (let i = 0; i < GIFT_LIMIT.limit; i += 1) {
      expect((await give({ amount: 1 })).status).toBe(201);
    }
    const reply = await give({ amount: 1 });
    expect(reply.status).toBe(429);
    expect(reply.headers['retry-after']).toBe('600');
    expect((await list()).json.supporters).toHaveLength(GIFT_LIMIT.limit);
  });

  it('counts each visitor behind the proxy on its own', async () => {
    await start({ trustProxy: true });
    const from = (address) => ({ 'x-forwarded-for': address });
    for (let i = 0; i < GIFT_LIMIT.limit; i += 1) {
      await give({ amount: 1 }, from('1.1.1.1'));
    }
    expect((await give({ amount: 1 }, from('1.1.1.1'))).status).toBe(429);
    expect((await give({ amount: 1 }, from('2.2.2.2'))).status).toBe(201);
  });
});

describe('GET /api/health', () => {
  it('answers ok while the store answers', async () => {
    await start();
    const reply = await sendRequest(server.port, { path: '/api/health' });
    expect(reply.status).toBe(200);
    expect(JSON.parse(reply.text)).toEqual({ ok: true });
  });

  it('answers 503 when the database is down', async () => {
    const supporters = {
      list: async () => [],
      add: async () => ({}),
      ping: async () => {
        throw new Error('connection refused');
      },
    };
    await start({ supporters });
    const reply = await sendRequest(server.port, { path: '/api/health' });
    expect(reply.status).toBe(503);
  });
});
