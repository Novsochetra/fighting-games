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
  {
    name: '0002_scores',
    statements: [
      `CREATE TABLE scores (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        game text NOT NULL CHECK (char_length(game) <= 40),
        name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 20 AND name !~ '[[:cntrl:]]'),
        score integer NOT NULL CHECK (score > 0),
        mission smallint NOT NULL CHECK (mission > 0),
        hero text NOT NULL CHECK (char_length(hero) <= 40),
        difficulty smallint NOT NULL CHECK (difficulty >= 0),
        play_seconds integer NOT NULL CHECK (play_seconds >= 0),
        cleared boolean NOT NULL DEFAULT false,
        ticket text NOT NULL UNIQUE CHECK (char_length(ticket) <= 40),
        created_at timestamptz NOT NULL DEFAULT now(),
        hidden boolean NOT NULL DEFAULT false
      )`,
      // the all-time board reads the top of this; the week's reads the week's rows by date
      'CREATE INDEX scores_by_score ON scores (game, score DESC, id) WHERE NOT hidden',
      'CREATE INDEX scores_by_date ON scores (game, created_at) WHERE NOT hidden',
      `CREATE TABLE server_secrets (
        name text PRIMARY KEY,
        value text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )`,
    ],
  },
];
