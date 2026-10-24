import { createPostgresDatabase, describeDatabase } from '../db/postgres.js';
import { createMemorySupportersStore } from './memory-store.js';
import { createPostgresSupportersStore } from './postgres-store.js';

export function openSupportersStore({ databaseUrl, logError = console.error }) {
  if (!databaseUrl) {
    return {
      supporters: createMemorySupportersStore(),
      close: async () => {},
      description:
        'Supporters kept in memory until the server stops (set DATABASE_URL to keep them)',
    };
  }
  const database = createPostgresDatabase({ connectionString: databaseUrl, logError });
  return {
    supporters: createPostgresSupportersStore(database),
    close: () => database.close(),
    description: `Supporters in Postgres ${describeDatabase(databaseUrl)}`,
  };
}
