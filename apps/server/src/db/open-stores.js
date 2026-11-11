import { createMemoryScoresStore } from '../leaderboard/memory-store.js';
import { createPostgresScoresStore } from '../leaderboard/postgres-store.js';
import { createMemorySupportersStore } from '../supporters/memory-store.js';
import { createPostgresSupportersStore } from '../supporters/postgres-store.js';
import { createMemoryWallpapersStore } from '../wallpapers/memory-store.js';
import { createPostgresWallpapersStore } from '../wallpapers/postgres-store.js';
import { createPostgresDatabase, describeDatabase } from './postgres.js';

export function openStores({ databaseUrl, logError = console.error }) {
  if (!databaseUrl) {
    return {
      stores: {
        supporters: createMemorySupportersStore(),
        scores: createMemoryScoresStore(),
        wallpapers: createMemoryWallpapersStore(),
      },
      close: async () => {},
      description:
        'Supporters, scores and wallpaper likes kept in memory until the server stops (set DATABASE_URL to keep them)',
    };
  }

  const database = createPostgresDatabase({ connectionString: databaseUrl, logError });

  return {
    stores: {
      supporters: createPostgresSupportersStore(database),
      scores: createPostgresScoresStore(database),
      wallpapers: createPostgresWallpapersStore(database),
    },
    close: () => database.close(),
    description: `Supporters, scores and wallpaper likes in Postgres ${describeDatabase(databaseUrl)}`,
  };
}
