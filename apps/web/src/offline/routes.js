// The arcade's own pages, under the worker's scope, which it keeps with the arcade's files.
const PAGES = ['', 'supporters/', 'credits/'];
// the API's reads (api-cache.js keeps their last answers)
const API_READS = ['api/games', 'api/supporters'];
const GAME = /^games\/([\w-]+)\//;

const pathUnder = (url, scope) =>
  url.pathname.slice(scope.pathname.length).replace(/(^|\/)index\.html$/, '$1');

function sameOriginRoute(request, path) {
  const game = GAME.exec(path);

  if (game) {
    return { kind: 'game', id: game[1] };
  }

  if (API_READS.includes(path)) {
    return { kind: 'api' };
  }

  if (request.mode === 'navigate') {
    return PAGES.includes(path) ? { kind: 'page', key: `${path}index.html` } : { kind: 'navigate' };
  }

  return { kind: 'file', key: path };
}

// What the worker does with a request: the arcade's pages and files come from what it keeps, the
// API's reads from the network first, a game from its own download, and anything else (a gift sent,
// another site) is left to the browser.
export function routeOf(request, scopeUrl) {
  const url = new URL(request.url);
  const scope = new URL(scopeUrl);
  const isOurs = url.origin === scope.origin && url.pathname.startsWith(scope.pathname);

  if (!isOurs || request.method !== 'GET') {
    return { kind: 'pass' };
  }

  return sameOriginRoute(request, pathUnder(url, scope));
}
