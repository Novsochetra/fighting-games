import { expect, it } from 'vitest';
import { sendRequest, startTestServer } from '../support/test-server.js';

const UPLOADS = 5;

// The server turns away a poster over the limit before it reads the body, so its answer came while
// the helper was still sending; closing the server then cut that upload, and on macOS the client's
// socket raised an EPIPE no listener caught.
it('finishes an upload the server answers early before the test closes the server', async () => {
  for (let i = 0; i < UPLOADS; i++) {
    const server = await startTestServer({ limiters: { poster: () => false } });
    const body = JSON.stringify({ padding: 'x'.repeat(2_000_000) });
    const headers = {
      origin: server.baseUrl,
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(body),
    };
    const reply = await sendRequest(server.port, {
      method: 'POST',
      path: '/api/leaderboard/posters',
      headers,
      body,
    });

    await server.close();
    expect(reply.status).toBe(429);
  }
});
