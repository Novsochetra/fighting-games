import { sendJson } from '../http-responses.js';

// Railway sends traffic to a new deploy only once this answers 200.
export function createHealthHandler({ supporters, logError }) {
  return async function serveHealth(_request, response) {
    try {
      await supporters.ping();
      sendJson(response, { status: 200, json: '{"ok":true}' });
    } catch (error) {
      logError(error);
      sendJson(response, { status: 503, json: '{"ok":false}' });
    }
  };
}
