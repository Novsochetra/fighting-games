import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { migrate } from '../../src/db/migrate.js';
import { MIGRATIONS } from '../../src/db/migrations.js';
import { createPostgresScoresStore } from '../../src/leaderboard/postgres-store.js';
import { createPgliteDatabase } from '../support/pglite-database.js';

let database;
let store;

// a Postgres compiled to WebAssembly takes seconds to start while the whole suite runs
beforeEach(async () => {
  database = await createPgliteDatabase();
  await migrate(database);
  store = createPostgresScoresStore(database);
}, 30000);

afterEach(() => database.close());

const run = (name, score, extra) => ({
  game: 'brawler',
  name,
  score,
  mission: 4,
  hero: 'bokator',
  difficulty: 2,
  seconds: 610,
  cleared: false,
  ...extra,
});

const KEY = 'posters/brawler/0123456789abcdef01234567';
const OTHER_KEY = 'posters/brawler/89abcdef0123456789abcdef';

const datedAt = (name, time) =>
  database.query('UPDATE scores SET created_at = $2 WHERE name = $1', [name, time]);

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
    expect(board.week.map((saved) => saved.name)).toEqual(['TIE', 'NEW']);
    expect(board.allTime.map((saved) => saved.name)).toEqual(['OLD', 'TIE', 'NEW']);
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
    await database.query("UPDATE scores SET hidden = true WHERE name = 'BAD'");
    const { allTime } = await store.board('brawler', { weekStart: WEEK, size: 10 });
    expect(allTime.map((saved) => saved.name)).toEqual(['MEY']);
    expect((await store.rank(fair, new Date(0))).allTime).toBe(1);
  });

  it('finds a run waiting for its poster by its ticket, and takes the poster once', async () => {
    const saved = await store.add(run('SOK', 4200), 'nonce-1');
    const since = new Date(Date.now() - 60_000);
    expect(await store.posterless('brawler', 'nonce-2', since)).toBeNull();
    expect(await store.posterless('puzzle', 'nonce-1', since)).toBeNull();
    expect((await store.posterless('brawler', 'nonce-1', since)).id).toBe(saved.id);
    expect(await store.setPoster(saved.id, KEY)).toBe(true);
    expect(await store.setPoster(saved.id, OTHER_KEY)).toBe(false);
    expect(await store.posterless('brawler', 'nonce-1', since)).toBeNull();
    const { week } = await store.board('brawler', { weekStart: WEEK, size: 10 });
    expect(week[0].poster).toBe(KEY);
  });

  it('gives no poster to a run posted too long ago, or hidden', async () => {
    await store.add(run('OLD', 10), 'old');
    await store.add(run('BAD', 20), 'bad');
    await datedAt('OLD', '2026-10-20T00:00:00Z');
    await database.query("UPDATE scores SET hidden = true WHERE name = 'BAD'");
    const since = new Date('2026-10-21T00:00:00Z');
    expect(await store.posterless('brawler', 'old', since)).toBeNull();
    expect(await store.posterless('brawler', 'bad', since)).toBeNull();
  });

  it('takes a poster off the board with its key set back to NULL, and keeps the run', async () => {
    const saved = await store.add(run('SOK', 4200), 'nonce-1');
    await store.setPoster(saved.id, KEY);
    await database.query('UPDATE scores SET poster = NULL WHERE id = $1', [saved.id]);
    const { week } = await store.board('brawler', { weekStart: WEEK, size: 10 });
    expect(week).toEqual([expect.objectContaining({ name: 'SOK', poster: null })]);
  });

  it.each([
    ['a row id', '1'],
    ['a whole address', `https://files.example.test/${KEY}-192.jpg`],
    ['a file of the poster', `${KEY}-192.jpg`],
    ['a name too short', 'posters/brawler/abc123'],
  ])('refuses %s typed in by hand in place of a poster key', async (_label, typed) => {
    const saved = await store.add(run('SOK', 4200), 'nonce-1');
    const typedIn = database.query('UPDATE scores SET poster = $2 WHERE id = $1', [
      saved.id,
      typed,
    ]);
    await expect(typedIn).rejects.toThrow(/scores_poster_key/);
    await database.query('UPDATE scores SET poster = $2 WHERE id = $1', [saved.id, KEY]);
    const { week } = await store.board('brawler', { weekStart: WEEK, size: 10 });
    expect(week[0].poster).toBe(KEY);
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
    const insert = (name, score) =>
      database.query(
        `INSERT INTO scores (game, name, score, mission, hero, difficulty, play_seconds, ticket)
         VALUES ('brawler', $1, $2, 1, 'moss', 0, 10, $3)`,
        [name, score, `ticket-${score}-${name.length}`],
      );
    await expect(insert('', 10)).rejects.toThrow(/check/);
    await expect(insert('x'.repeat(21), 11)).rejects.toThrow(/check/);
    await expect(insert('Sok\nDara', 12)).rejects.toThrow(/check/);
    await expect(insert('Sok', 0)).rejects.toThrow(/check/);
    await expect(insert('សុខ ដារ៉ា', 13)).resolves.toBeDefined();
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

describe('the poster key check, as it is deployed', () => {
  it('lets the deploy through over a value typed in by hand before it, and checks every write after', async () => {
    const older = await createPgliteDatabase();

    try {
      await migrate(older, MIGRATIONS.slice(0, 3));
      const scores = createPostgresScoresStore(older);
      const saved = await scores.add(run('DARA', 338314), 'nonce-1');
      await older.query("UPDATE scores SET poster = '1' WHERE id = $1", [saved.id]);
      expect(await migrate(older)).toEqual(['0004_poster_key_shape']);
      const { rows } = await older.query('SELECT poster FROM scores WHERE id = $1', [saved.id]);
      expect(rows[0].poster).toBe('1');
      const again = older.query("UPDATE scores SET poster = '2' WHERE id = $1", [saved.id]);
      await expect(again).rejects.toThrow(/scores_poster_key/);
    } finally {
      await older.close();
    }
  }, 30000);
});
