import { describe, expect, it, vi } from 'vitest';
import { createBoardCache } from '../../src/leaderboard/board-cache.js';
import { createMemoryScoresStore } from '../../src/leaderboard/memory-store.js';

const run = (initials, score, extra) => ({
  game: 'brawler',
  initials,
  score,
  mission: 2,
  hero: 'moss',
  difficulty: 1,
  seconds: 120,
  cleared: false,
  ...extra,
});

describe('the memory scores store', () => {
  const WEEK = new Date('2026-10-25T17:00:00Z');

  function storeAt(times) {
    const dates = times.map((time) => new Date(time));
    return createMemoryScoresStore({ now: () => dates.shift() });
  }

  it('spends a ticket on one score only', async () => {
    const store = createMemoryScoresStore();
    expect(await store.add(run('SOK', 10), 'nonce-1')).toMatchObject({ initials: 'SOK' });
    expect(await store.add(run('DAR', 20), 'nonce-1')).toBeNull();
  });

  it('ranks by score, the earlier run first on a tie, this week and all time', async () => {
    const store = storeAt(['2026-10-20T00:00:00Z', '2026-10-27T00:00:00Z', '2026-10-28T00:00:00Z']);
    await store.add(run('OLD', 500), 'a');
    await store.add(run('TIE', 300), 'b');
    const late = await store.add(run('NEW', 300), 'c');
    const board = await store.board('brawler', { weekStart: WEEK, size: 10 });
    expect(board.week.map((saved) => saved.initials)).toEqual(['TIE', 'NEW']);
    expect(board.allTime.map((saved) => saved.initials)).toEqual(['OLD', 'TIE', 'NEW']);
    expect(await store.rank(late, WEEK)).toEqual({ week: 2, allTime: 3 });
  });

  it('keeps each game to its own board, and each board to its size', async () => {
    const store = createMemoryScoresStore();
    for (let i = 1; i <= 12; i += 1) {
      await store.add(run('AAA', i * 10), `n${i}`);
    }
    await store.add(run('PUZ', 9999, { game: 'puzzle' }), 'other');
    const { allTime } = await store.board('brawler', { weekStart: new Date(0), size: 10 });
    expect(allTime).toHaveLength(10);
    expect(allTime[0].score).toBe(120);
    expect(allTime.every((saved) => saved.game === 'brawler')).toBe(true);
  });

  it('keeps one secret for as long as it runs', async () => {
    const store = createMemoryScoresStore();
    expect(await store.secret()).toBe(await store.secret());
    expect((await store.secret()).length).toBeGreaterThanOrEqual(32);
  });
});

describe('createBoardCache', () => {
  function cacheAt(load) {
    const clock = { time: 0 };
    return { clock, cache: createBoardCache({ load, freshMs: 1000, now: () => clock.time }) };
  }

  it('reads the database once for every reader while the board is fresh', async () => {
    const load = vi.fn(async (game) => `${game} board`);
    const { clock, cache } = cacheAt(load);
    const answers = await Promise.all([cache.get('brawler'), cache.get('brawler')]);
    clock.time = 999;
    await cache.get('brawler');
    expect(answers).toEqual(['brawler board', 'brawler board']);
    expect(load).toHaveBeenCalledTimes(1);
    clock.time = 1000;
    await cache.get('brawler');
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('reads again at once after a score changes the board', async () => {
    const load = vi.fn(async () => 'board');
    const { cache } = cacheAt(load);
    await cache.get('brawler');
    cache.forget('brawler');
    await cache.get('brawler');
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('keeps no failed read, so the next reader tries again', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValue('board');
    const { cache } = cacheAt(load);
    await expect(cache.get('brawler')).rejects.toThrow('down');
    await expect(cache.get('brawler')).resolves.toBe('board');
  });
});
