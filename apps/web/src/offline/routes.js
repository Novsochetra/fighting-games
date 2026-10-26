// The arcade's own pages, under the worker's scope, which it keeps with the arcade's files.
const PAGES = ['', 'supporters/', 'credits/'];
// the API's reads (api-cache.js keeps their last answers)
const API_READS = ['api/games', 'api/supporters'];
const GAME = /^games\/([\w-]+)\//;
// where the arcade asks how much of a game is kept (GET), saves it (POST) and removes it (DELETE);
// only the worker answers it, so without one the arcade finds nothing there and offers no save
const SAVE = /^api\/offline\/([\w-]+)$/;
// the version of the build the server holds now, which the arcade reads past every cache to learn
// of a deploy (src/arcade/update-check.js), so the worker never answers it from what it keeps
const VERSION = 'version.json';

const pathUnder = (url, scope) =>
  url.pathname.slice(scope.pathname.length).replace(/(^|\/)index\.html$/, '$1');

function sameOriginRoute(request, path) {
  const game = GAME.exec(path);

  if (game) {
    return { kind: 'game', id: game[1], key: path };
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
// API's reads from the network first, a game from its own download (and a save of it, from the
// worker), and anything else (a gift sent, another site) is left to the browser.
export function routeOf(request, scopeUrl) {
  const url = new URL(request.url);
  const scope = new URL(scopeUrl);
  const isOurs = url.origin === scope.origin && url.pathname.startsWith(scope.pathname);
  const path = isOurs ? pathUnder(url, scope) : '';
  const save = SAVE.exec(path);

  if (save && ['GET', 'POST', 'DELETE'].includes(request.method)) {
    return { kind: 'save', id: save[1] };
  }

  if (!isOurs || request.method !== 'GET' || path === VERSION) {
    return { kind: 'pass' };
  }

  return sameOriginRoute(request, path);
}
