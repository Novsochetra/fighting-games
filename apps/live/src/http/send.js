import { sendBody } from '@arcade/server/src/http-responses.js';

export function sendLiveJson(response, { status, json, headers }) {
  sendBody(response, {
    status,
    contentType: 'application/json; charset=utf-8',
    body: JSON.stringify(json),
    headers,
  });
}

export function sendLiveError(response, { status, reason, headers }) {
  sendLiveJson(response, { status, json: { error: reason }, headers });
}
