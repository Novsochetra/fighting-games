import { PGlite } from '@electric-sql/pglite';

// A real Postgres compiled to WebAssembly, in the test's own process, behind the same small
// interface as the pg pool in src/db/postgres.js.
export async function createPgliteDatabase() {
  const db = await PGlite.create();
  return {
    query: (text, values) => db.query(text, values),
    transaction: (work) => db.transaction((tx) => work((text, values) => tx.query(text, values))),
    close: () => db.close(),
  };
}
