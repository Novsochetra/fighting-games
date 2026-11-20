import { PartyError } from '../parties/party-error.js';
import { corsHeaders, isAllowedOrigin } from './cross-site.js';
import { readJson } from './read-json.js';
import { sendLiveError, sendLiveJson } from './send.js';

const HEALTH_PATH = '/api/health';

export async function answer({ request, response, live }) {
  const headers = corsHeaders(request.headers, live.origins);
  const { pathname } = new URL(request.url ?? '/', 'http://live');

  if (request.method === 'OPTIONS') {
    response.writeHead(204, headers).end();
    return;
  }

  if (request.method === 'GET' && pathname === HEALTH_PATH) {
    sendLiveJson(response, {
      status: 200,
      json: { ok: true, parties: live.partyCount() },
      headers,
    });
    return;
  }

  const refusal = refusalOf({ request, pathname, live });
  if (refusal) {
    sendLiveError(response, { ...refusal, headers });
    return;
  }

  await runRoute({ request, response, route: live.routes[pathname], headers });
}

function refusalOf({ request, pathname, live }) {
  if (request.method !== 'POST' || !live.routes[pathname]) {
    return { status: 404, reason: 'not-found' };
  }

  if (!isAllowedOrigin(request.headers, live.origins)) {
    return { status: 403, reason: 'origin' };
  }

  if (!live.allowCall(request, pathname)) {
    return { status: 429, reason: 'slow-down' };
  }

  return null;
}

async function runRoute({ request, response, route, headers }) {
  try {
    const json = await route(await readJson(request));
    sendLiveJson(response, { status: 200, json, headers });
  } catch (error) {
    if (!(error instanceof PartyError)) {
      throw error;
    }

    sendLiveError(response, { status: error.status, reason: error.reason, headers });
  }
}
