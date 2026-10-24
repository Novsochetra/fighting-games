export const BASE_HEADERS = {
  'Cache-Control': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
};

// Node drops the body of a HEAD response on its own, so callers can always pass one.
export function sendBody(response, { status, contentType, body, headers = {} }) {
  response.writeHead(status, {
    ...BASE_HEADERS,
    'Content-Type': contentType,
    'Content-Length': Buffer.byteLength(body),
    ...headers,
  });
  response.end(body);
}

export function sendText(response, { status, text, headers }) {
  sendBody(response, { status, contentType: 'text/plain; charset=utf-8', body: text, headers });
}

export function sendJson(response, { status, json }) {
  sendBody(response, { status, contentType: 'application/json; charset=utf-8', body: json });
}

export function sendNotFound(response) {
  sendText(response, { status: 404, text: 'Not found\n' });
}

export function sendJsonError(response, { status, message, headers }) {
  const json = JSON.stringify({ error: message });
  sendBody(response, {
    status,
    contentType: 'application/json; charset=utf-8',
    body: json,
    headers,
  });
}

export function sendForbidden(response) {
  sendJsonError(response, { status: 403, message: 'Only the arcade itself may call this.' });
}

export function sendMethodNotAllowed(response, allow = ['GET', 'HEAD']) {
  sendText(response, {
    status: 405,
    text: 'Method not allowed\n',
    headers: { Allow: allow.join(', ') },
  });
}

export function sendRedirect(response, location) {
  sendText(response, {
    status: 301,
    text: `Moved to ${location}\n`,
    headers: { Location: location },
  });
}

export function sendServerError(response) {
  sendText(response, { status: 500, text: 'Server error\n' });
}
