import http from 'node:http';
import { sendForbidden, sendMethodNotAllowed, sendServerError } from './http-responses.js';
import { GAMES_ROOT, WEB_ROOT } from './paths.js';
import { chooseRoute } from './router.js';
import { createApiRoutes } from './routes/api-routes.js';
import { createStaticHandler } from './routes/static-files.js';
import { isFromOtherSite } from './security/request-origin.js';
import { splitRequestTarget } from './static-path.js';
import { createMemoryScoresStore } from './leaderboard/memory-store.js';
import { createMemorySupportersStore } from './supporters/memory-store.js';

// without a database (a laptop, the tests) what is sent is kept in memory until the server stops
function storesOrMemory({ supporters, scores }) {
  return {
    supporters: supporters ?? createMemorySupportersStore(),
    scores: scores ?? createMemoryScoresStore(),
  };
}

export function createArcadeServer({
  webRoot = WEB_ROOT,
  gamesRoot = GAMES_ROOT,
  trustProxy = false,
  limiters,
  now = Date.now,
  warn = console.warn,
  logError = console.error,
  serveFiles,
  ...stores
} = {}) {
  const routes = createApiRoutes({
    gamesRoot,
    stores: storesOrMemory(stores),
    trustProxy,
    limiters,
    log: { warn, logError },
    now,
  });
  const serveStatic = serveFiles ?? createStaticHandler({ webRoot });
  return http.createServer((request, response) => {
    dispatch({ request, response, routes, serveStatic }).catch((error) => {
      logError(error);
      if (response.headersSent) {
        response.destroy();
      } else {
        sendServerError(response);
      }
    });
  });
}

// The API sends no CORS headers, so another site's page can neither read its answers nor get a
// preflight past the 405 for OPTIONS; refusing other sites here also stops the requests a browser
// sends without asking first.
async function dispatch({ request, response, routes, serveStatic }) {
  const { pathname } = splitRequestTarget(request.url);
  const route = chooseRoute(routes, { method: request.method, pathname });
  if (route.type === 'method-not-allowed') {
    return sendMethodNotAllowed(response, route.allow);
  }
  if (route.type === 'handler') {
    return isFromOtherSite(request.headers)
      ? sendForbidden(response)
      : route.handle(request, response);
  }
  return serveStatic(request, response);
}
