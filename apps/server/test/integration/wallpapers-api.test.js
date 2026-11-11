import { afterEach, describe, expect, it } from 'vitest';
import { sendRequest, startTestServer } from '../support/test-server.js';

const VISITOR = '3f2b8c1e-4a5d-4e6f-8a9b-0c1d2e3f4a5b';
const OTHER = 'a1b2c3d4-e5f6-4a7b-9c8d-e9f0a1b2c3d4';

let server;

afterEach(() => server?.close());

async function start(options) {
  server = await startTestServer(options);
}

function post(path, body, headers = {}) {
  const text = JSON.stringify(body);

  return sendRequest(server.port, {
    method: 'POST',
    path,
    headers: {
      origin: `http://127.0.0.1:${server.port}`,
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(text),
      ...headers,
    },
    body: text,
  });
}

const like = (visitor, liked, wallpaper = 'kulen-night') =>
  post('/api/wallpapers/likes', { wallpaper, visitor, liked });
const download = (shape, wallpaper = 'kulen-night') =>
  post('/api/wallpapers/downloads', { wallpaper, shape });
const counts = async () =>
  JSON.parse((await sendRequest(server.port, { path: '/api/wallpapers' })).text);
const jsonOf = (reply) => JSON.parse(reply.text);

describe('the wallpapers API', () => {
  it('starts with no likes or downloads', async () => {
    await start();
    expect(await counts()).toEqual({ wallpapers: {} });
  });

  it('counts each visitor’s like once, and lets them take it back', async () => {
    await start();
    expect(jsonOf(await like(VISITOR, true))).toEqual({
      wallpaper: 'kulen-night',
      liked: true,
      likes: 1,
    });
    expect(jsonOf(await like(VISITOR, true)).likes).toBe(1);
    expect(jsonOf(await like(OTHER, true)).likes).toBe(2);
    expect(jsonOf(await like(VISITOR, false)).likes).toBe(1);
    expect((await counts()).wallpapers['kulen-night']).toEqual({ likes: 1, downloads: 0 });
  });

  it('counts every download of a wallpaper', async () => {
    await start();
    const first = await download('phone');

    expect(first.status).toBe(201);
    expect(jsonOf(await download('desktop')).downloads).toBe(2);
    expect((await counts()).wallpapers['kulen-night']).toEqual({ likes: 0, downloads: 2 });
  });

  it('turns away a wallpaper the arcade does not have', async () => {
    await start();
    expect((await like(VISITOR, true, 'made-up')).status).toBe(400);
    expect((await download('phone', 'made-up')).status).toBe(400);
    expect(await counts()).toEqual({ wallpapers: {} });
  });

  it('takes likes and downloads only from the arcade’s own pages', async () => {
    await start();
    const reply = await post(
      '/api/wallpapers/likes',
      { wallpaper: 'kulen-night', visitor: VISITOR, liked: true },
      { origin: 'https://elsewhere.example' },
    );

    expect(reply.status).toBe(403);
  });

  it('holds back a burst from one address', async () => {
    await start({ limiters: { like: () => false, download: () => false } });
    const liked = await like(VISITOR, true);

    expect(liked.status).toBe(429);
    expect(liked.headers['retry-after']).toBe('600');
    expect((await download('phone')).status).toBe(429);
  });
});
