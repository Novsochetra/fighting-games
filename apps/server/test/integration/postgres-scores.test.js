import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { migrate } from '../../src/db/migrate.js';
import { createPostgresScoresStore } from '../../src/leaderboard/postgres-store.js';
import { createPgliteDatabase } from '../support/pglite-database.js';

let database;
let store;

beforeEach(async () => {
  database = await createPgliteDatabase();
  await migrate(database);
  store = createPostgresScoresStore(database);
});

afterEach(() => database.close());

const run = (initials, score, extra) => ({
  game: 'brawler',
  initials,
  score,
  mission: 4,
  hero: 'bokator',
  difficulty: 2,
  seconds: 610,
  cleared: false,
  ...extra,
});

const datedAt = (initials, time) =>
  database.query('UPDATE scores SET created_at = $2 WHERE initials = $1', [initials, time]);

describe('the Postgres scores store', () => {
  const WEEK = new Date('2026-10-25T17:00:00Z');

  it('saves a run and reads it back as it was sent', async () => {
    const saved = await store.add(run('SOK', 4200), 'nonce-1');
    expect(saved).toMatchObject({ ...run('SOK', 4200), id: expect.any(Number) });
    expect(saved.createdAt).toBeInstanceOf(Date);
  });

  it('spends a ticket on one score only', async () => {
    await store.add(run('SOK', 4200), 'nonce-1');
    expect(await store.add(run('DAR', 9000), 'nonce-1')).toBeNull();
    const { rows } = await database.query('SELECT count(*)::int AS count FROM scores');
    expect(rows[0].count).toBe(1);
  });

  it('ranks by score, the earlier run first on a tie, this week and all time', async () => {
    await store.add(run('OLD', 500), 'a');
    await store.add(run('TIE', 300), 'b');
    const late = await store.add(run('NEW', 300), 'c');
    await store.add(run('PUZ', 9999, { game: 'puzzle' }), 'd');
    await datedAt('OLD', '2026-10-20T00:00:00Z');
    const board = await store.board('brawler', { weekStart: WEEK, size: 10 });
    expect(board.week.map((saved) => saved.initials)).toEqual(['TIE', 'NEW']);
    expect(board.allTime.map((saved) => saved.initials)).toEqual(['OLD', 'TIE', 'NEW']);
    expect(await store.rank(late, WEEK)).toEqual({ week: 2, allTime: 3 });
  });

  it('keeps a board to its size', async () => {
    for (let i = 1; i <= 12; i += 1) {
      await store.add(run('AAA', i), `n${i}`);
    }
    const { week, allTime } = await store.board('brawler', { weekStart: new Date(0), size: 10 });
    expect(allTime.map((saved) => saved.score)).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3]);
    expect(week).toHaveLength(10);
  });

  it('leaves out a run the owner hid, from the boards and the ranks', async () => {
    await store.add(run('BAD', 99999), 'a');
    const fair = await store.add(run('MEY', 100), 'b');
    await database.query("UPDATE scores SET hidden = true WHERE initials = 'BAD'");
    const { allTime } = await store.board('brawler', { weekStart: WEEK, size: 10 });
    expect(allTime.map((saved) => saved.initials)).toEqual(['MEY']);
    expect((await store.rank(fair, new Date(0))).allTime).toBe(1);
  });

  it('keeps the first secret made, so every server after a deploy checks the same tickets', async () => {
    const first = await store.secret();
    expect(first.length).toBeGreaterThanOrEqual(32);
    expect(await createPostgresScoresStore(database).secret()).toBe(first);
  });

  // every value goes to Postgres as a bound parameter, never spliced into the SQL, so these are
  // stored and matched as plain text
  it('stores SQL in a value as text, and runs none of it', async () => {
    const drop = "x'); DROP TABLE scores; --";
    const saved = await store.add(run('SOK', 100, { game: drop, hero: drop }), "n'; --");
    expect(saved).toMatchObject({ game: drop, hero: drop });
    const { rows } = await database.query("SELECT to_regclass('scores') AS found");
    expect(rows[0].found).toBe('scores');
    expect((await store.board(drop, { weekStart: WEEK, size: 10 })).allTime).toHaveLength(1);
  });

  it('matches a game name that tries to widen the query as one name, finding nothing', async () => {
    await store.add(run('SOK', 100), 'a');
    const sneaky = "brawler' OR '1'='1";
    const board = await store.board(sneaky, { weekStart: new Date(0), size: 10 });
    expect(board).toEqual({ week: [], allTime: [] });
  });

  it('holds the checks in the table too', async () => {
    const insert = (initials, score) =>
      database.query(
        `INSERT INTO scores (game, initials, score, mission, hero, difficulty, play_seconds, ticket)
         VALUES ('brawler', $1, $2, 1, 'moss', 0, 10, $1)`,
        [initials, score],
      );
    await expect(insert('sok', 10)).rejects.toThrow(/check/);
    await expect(insert('<b>', 10)).rejects.toThrow(/check/);
    await expect(insert('SOK', 0)).rejects.toThrow(/check/);
    await expect(insert('SOK', 10)).resolves.toBeDefined();
  });

  it('answers the health check once migrated', async () => {
    await expect(store.ping()).resolves.toBeUndefined();
  });
});

describe('a database the pre-deploy never gave the scores table', () => {
  it('fails the health check', async () => {
    const bare = await createPgliteDatabase();
    try {
      await expect(createPostgresScoresStore(bare).ping()).rejects.toThrow();
    } finally {
      await bare.close();
    }
  });
});
