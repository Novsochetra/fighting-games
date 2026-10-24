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

export function sendRequest(port, { method = 'GET', path: rawPath, headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      { host: '127.0.0.1', port, path: rawPath, method, headers },
      (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          resolve({ status: response.statusCode, headers: response.headers, text });
        });
      },
    );
    request.on('error', reject);
    request.end(body);
  });
}
