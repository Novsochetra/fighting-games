import { randomBytes } from 'node:crypto';

const COLUMNS =
  'id, game, name, score, mission, hero, difficulty, play_seconds, cleared, created_at, poster';
const SHOWN = 'game = $1 AND NOT hidden';

const ADD = `INSERT INTO scores
  (game, name, score, mission, hero, difficulty, play_seconds, cleared, ticket)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  ON CONFLICT (ticket) DO NOTHING
  RETURNING ${COLUMNS}`;
const TOP = `SELECT ${COLUMNS} FROM scores WHERE ${SHOWN} ORDER BY score DESC, id LIMIT $2`;
const TOP_SINCE = `SELECT ${COLUMNS} FROM scores WHERE ${SHOWN} AND created_at >= $3
  ORDER BY score DESC, id LIMIT $2`;
// every run at or above it that came before it, since a tie ranks the earlier run higher
const RANK = `SELECT count(*) FILTER (WHERE created_at >= $3) AS week, count(*) AS all_time
  FROM scores WHERE ${SHOWN} AND score >= $2 AND id <> $4`;
// the first server to start keeps its secret, and every one after reads that same one, so a ticket
// given before a deploy is still good after it
const KEEP_SECRET =
  'INSERT INTO server_secrets (name, value) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING';
const READ_SECRET = 'SELECT value FROM server_secrets WHERE name = $1';
const TICKET_SECRET = 'run-tickets';
const POSTERLESS = `SELECT ${COLUMNS} FROM scores WHERE game = $1 AND ticket = $2
  AND poster IS NULL AND NOT hidden AND created_at >= $3`;
const SET_POSTER = 'UPDATE scores SET poster = $2 WHERE id = $1 AND poster IS NULL RETURNING id';
const PING = 'SELECT 1 FROM scores LIMIT 1';

const toScore = (row) => ({
  id: Number(row.id),
  game: row.game,
  name: row.name,
  score: row.score,
  mission: row.mission,
  hero: row.hero,
  difficulty: row.difficulty,
  seconds: row.play_seconds,
  cleared: row.cleared,
  createdAt: new Date(row.created_at),
  poster: row.poster,
});

export function createPostgresScoresStore(database) {
  const rowsOf = async (text, values) => (await database.query(text, values)).rows;

  return {
    async add(run, ticket) {
      const { game, name, score, mission, hero, difficulty, seconds, cleared } = run;
      const values = [game, name, score, mission, hero, difficulty, seconds, cleared, ticket];
      const [row] = await rowsOf(ADD, values);

      return row ? toScore(row) : null;
    },

    async board(game, { weekStart, size }) {
      const [week, allTime] = await Promise.all([
        rowsOf(TOP_SINCE, [game, size, weekStart]),
        rowsOf(TOP, [game, size]),
      ]);

      return { week: week.map(toScore), allTime: allTime.map(toScore) };
    },

    async rank(run, weekStart) {
      const [row] = await rowsOf(RANK, [run.game, run.score, weekStart, run.id]);

      return { week: Number(row.week) + 1, allTime: Number(row.all_time) + 1 };
    },

    async posterless(game, ticket, since) {
      const [row] = await rowsOf(POSTERLESS, [game, ticket, since]);

      return row ? toScore(row) : null;
    },

    async setPoster(id, posterKey) {
      return (await rowsOf(SET_POSTER, [id, posterKey])).length === 1;
    },

    async secret() {
      await database.query(KEEP_SECRET, [TICKET_SECRET, randomBytes(32).toString('base64url')]);
      const [row] = await rowsOf(READ_SECRET, [TICKET_SECRET]);

      return row.value;
    },

    async ping() {
      await database.query(PING);
    },
  };
}
