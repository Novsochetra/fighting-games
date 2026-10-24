import { createGamesApiHandler } from './games-api.js';
import { createHealthHandler } from './health.js';
import { createSupportersApi } from './supporters-api.js';

export function createApiRoutes({ gamesRoot, supporters, trustProxy, limiter, warn, logError }) {
  return [
    { path: '/api/games', handlers: { GET: createGamesApiHandler({ gamesRoot, warn }) } },
    {
      path: '/api/supporters',
      handlers: createSupportersApi({ supporters, trustProxy, limiter }),
    },
    { path: '/api/health', handlers: { GET: createHealthHandler({ supporters, logError }) } },
  ];
}
