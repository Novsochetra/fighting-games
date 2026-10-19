import http from 'node:http';
import { sendMethodNotAllowed, sendServerError } from './http-responses.js';
import { GAMES_ROOT, WEB_ROOT } from './paths.js';
import { chooseRoute } from './router.js';
import { createGamesApiHandler } from './routes/games-api.js';
import { createStaticHandler } from './routes/static-files.js';
import { splitRequestTarget } from './static-path.js';

export function createArcadeServer({
  webRoot = WEB_ROOT,
  gamesRoot = GAMES_ROOT,
  warn = console.warn,
  logError = console.error,
} = {}) {
  const routes = [{ path: '/api/games', handle: createGamesApiHandler({ gamesRoot, warn }) }];
  const serveStatic = createStaticHandler({ webRoot });
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

async function dispatch({ request, response, routes, serveStatic }) {
  const { pathname } = splitRequestTarget(request.url);
  const route = chooseRoute(routes, { method: request.method, pathname });
  if (route.type === 'method-not-allowed') {
    return sendMethodNotAllowed(response);
  }
  if (route.type === 'handler') {
    return route.handle(request, response);
  }
  return serveStatic(request, response);
}
