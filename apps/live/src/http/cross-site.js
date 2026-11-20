// The live service is called from other sites on purpose (each game's own address), so unlike the
// arcade's API it answers CORS, but only for the addresses in its list. A page anywhere else gets
// no CORS headers, so its browser shows it nothing, and its POST is refused before any work.
export function isAllowedOrigin(headers, origins) {
  return headers.origin === undefined || origins.includes(headers.origin);
}

export function corsHeaders(headers, origins) {
  if (!headers.origin || !origins.includes(headers.origin)) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': headers.origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };
}
