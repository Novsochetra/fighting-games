import { createLeaderboard } from '../leaderboard/create-leaderboard.js';
import { createGamesApiHandler } from './games-api.js';
import { createHealthHandler } from './health.js';
import { createLeaderboardApi } from './leaderboard-api.js';
import { createRunTicketsApi } from './run-tickets-api.js';
import { createSupportersApi } from './supporters-api.js';

export function createApiRoutes({ gamesRoot, stores, trustProxy, limiters = {}, log, now }) {
  const { supporters, scores } = stores;
  const leaderboard = createLeaderboard({ gamesRoot, scores, now });
  const { warn, logError } = log;

  return [
    { path: '/api/games', handlers: { GET: createGamesApiHandler({ gamesRoot, warn }) } },
    {
      path: '/api/supporters',
      handlers: createSupportersApi({ supporters, trustProxy, limiter: limiters.gift }),
    },
    {
      path: '/api/leaderboard',
      handlers: createLeaderboardApi({ leaderboard, trustProxy, limiter: limiters.score }),
    },
    {
      path: '/api/leaderboard/tickets',
      handlers: createRunTicketsApi({ leaderboard, trustProxy, limiter: limiters.ticket }),
    },
    {
      path: '/api/health',
      handlers: { GET: createHealthHandler({ stores: [supporters, scores], logError }) },
    },
  ];
}
