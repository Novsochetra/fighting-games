import { createLeaderboard } from '../leaderboard/create-leaderboard.js';
import { createGamesApiHandler } from './games-api.js';
import { createHealthHandler } from './health.js';
import { createLeaderboardApi } from './leaderboard-api.js';
import { createPostersApi } from './posters-api.js';
import { createRunTicketsApi } from './run-tickets-api.js';
import { createSupportersApi } from './supporters-api.js';
import {
  createWallpaperCountsApi,
  createWallpaperDownloadsApi,
  createWallpaperLikesApi,
} from './wallpapers-api.js';

export function createApiRoutes({ gamesRoot, stores, trustProxy, limiters = {}, log, now }) {
  const { supporters, scores, wallpapers, storage } = stores;
  const leaderboard = createLeaderboard({ gamesRoot, scores, storage, now });
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
      path: '/api/leaderboard/posters',
      handlers: createPostersApi({ leaderboard, trustProxy, limiter: limiters.poster }),
    },
    ...wallpaperRoutes({ wallpapers, trustProxy, limiters }),
    {
      path: '/api/health',
      handlers: {
        GET: createHealthHandler({ stores: [supporters, scores, wallpapers], logError }),
      },
    },
  ];
}

function wallpaperRoutes({ wallpapers, trustProxy, limiters }) {
  return [
    { path: '/api/wallpapers', handlers: createWallpaperCountsApi({ wallpapers }) },
    {
      path: '/api/wallpapers/likes',
      handlers: createWallpaperLikesApi({ wallpapers, trustProxy, limiter: limiters.like }),
    },
    {
      path: '/api/wallpapers/downloads',
      handlers: createWallpaperDownloadsApi({ wallpapers, trustProxy, limiter: limiters.download }),
    },
  ];
}
