import { once } from 'node:events';
import http from 'node:http';
import { createArcadeServer } from '../../src/create-server.js';

export async function startTestServer(options = {}) {
  const server = createArcadeServer({ warn: () => {}, logError: () => {}, ...options });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  return {
    port,
    baseUrl: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  };
}

// fetch normalizes "..", "%2e%2e" and friends before sending; this sends the path exactly as written.
export function rawRequest(port, rawPath, method = 'GET') {
  return new Promise((resolve, reject) => {
    const request = http.request({ host: '127.0.0.1', port, path: rawPath, method }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () =>
        resolve({
          status: response.statusCode,
          headers: response.headers,
          body: Buffer.concat(chunks).toString('utf8'),
        }),
      );
    });
    request.on('error', reject);
    request.end();
  });
}

async function readReply(response) {
  const chunks = [];

  for await (const chunk of response) {
    chunks.push(chunk);
  }

  const text = Buffer.concat(chunks).toString('utf8');

  return { status: response.statusCode, headers: response.headers, text };
}

// A server may answer (a 413, a 429) before it reads the body, and goes on draining it. Like a
// browser, this keeps an answer that came in full if the rest of the upload fails, and settles only
// once the upload is over, so a test never closes the server under a write still in flight.
export function sendRequest(port, { method = 'GET', path: rawPath, headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const state = { reply: null, closed: false };
    const settle = () => state.reply && state.closed && resolve(state.reply);
    const options = { host: '127.0.0.1', port, path: rawPath, method, headers };
    const request = http.request(options, (response) =>
      readReply(response).then((reply) => {
        state.reply = reply;
        settle();
      }, reject),
    );

    request.on('error', (error) => request.res?.complete || reject(error));
    request.on('close', () => {
      state.closed = true;
      settle();
    });
    request.end(body);
  });
}
