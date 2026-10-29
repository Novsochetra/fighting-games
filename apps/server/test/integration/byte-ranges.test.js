import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WEB_ROOT } from '../../src/paths.js';
import { startTestServer } from '../support/test-server.js';

const FILE = '/games/steel-and-dust/assets/icons/icon-192.png';

let server;
let bytes;

beforeAll(async () => {
  server = await startTestServer();
  bytes = await readFile(path.join(WEB_ROOT, FILE));
});

afterAll(() => server.close());

const get = (headers = {}) => fetch(`${server.baseUrl}${FILE}`, { headers });

describe('a file asked for in parts, as a video is', () => {
  it('says every file can be asked for in parts', async () => {
    const response = await get();

    expect(response.status).toBe(200);
    expect(response.headers.get('accept-ranges')).toBe('bytes');
  });

  it("answers Safari's first question, the first two bytes, with only those", async () => {
    const response = await get({ Range: 'bytes=0-1' });

    expect(response.status).toBe(206);
    expect(response.headers.get('content-range')).toBe(`bytes 0-1/${bytes.length}`);
    expect(response.headers.get('content-length')).toBe('2');
    expect(response.headers.get('content-type')).toBe('image/png');
    expect(Buffer.from(await response.arrayBuffer())).toEqual(bytes.subarray(0, 2));
  });

  it('sends the rest of the file from where the player has got to', async () => {
    const response = await get({ Range: 'bytes=100-' });

    expect(response.status).toBe(206);
    expect(Buffer.from(await response.arrayBuffer())).toEqual(bytes.subarray(100));
  });

  it('answers 416 for bytes past the end of the file', async () => {
    const response = await get({ Range: `bytes=${bytes.length}-` });

    expect(response.status).toBe(416);
    expect(response.headers.get('content-range')).toBe(`bytes */${bytes.length}`);
  });

  it('sends the whole file when the part asked for is of a version it no longer has', async () => {
    const response = await get({ Range: 'bytes=0-1', 'If-Range': '"an-older-version"' });

    expect(response.status).toBe(200);
    expect((await response.arrayBuffer()).byteLength).toBe(bytes.length);
  });

  it('sends a part of the version the browser holds the rest of', async () => {
    const tag = (await get()).headers.get('etag');
    const response = await get({ Range: 'bytes=0-1', 'If-Range': tag });

    expect(response.status).toBe(206);
  });
});
