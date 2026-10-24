// Each statement runs on its own, since PGlite (the tests' Postgres) takes one per query. Add new
// migrations at the end and never change one that has shipped.
export const MIGRATIONS = [
  {
    name: '0001_supporters',
    statements: [
      `CREATE TABLE supporters (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name text NOT NULL DEFAULT '' CHECK (char_length(name) <= 40),
        amount_cents integer NOT NULL CHECK (amount_cents > 0 AND amount_cents <= 1000000),
        message text NOT NULL DEFAULT '' CHECK (char_length(message) <= 140),
        created_at timestamptz NOT NULL DEFAULT now(),
        hidden boolean NOT NULL DEFAULT false
      )`,
    ],
  },
];
