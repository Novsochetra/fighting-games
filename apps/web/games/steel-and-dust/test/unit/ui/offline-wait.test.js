import { describe, expect, it } from 'vitest';
import {
  hasStalled,
  OFFLINE_PROGRESS,
  offlineShare,
  waitForOffline,
} from '../../../src/ui/loading/offline-wait.js';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

// a worker whose answers the test sets, and timers that fire only when it says so
function setUp(answer) {
  const asked = [];
  const timers = [];
  const shares = [];
  const clock = { now: 0 };
  const fetch = async (url, init) => {
    asked.push({ url, init });

    return answer.value === null
      ? new Response('Not found', { status: 404 })
      : new Response(JSON.stringify(answer.value));
  };
  const settled = { done: false };
  const waiting = waitForOffline({
    fetch,
    setTimer: (callback, ms) => timers.push({ callback, ms }),
    now: () => clock.now,
    onProgress: (share) => shares.push(share),
    stallMs: 1000,
  }).then(() => (settled.done = true));
  const tick = async (ms) => {
    clock.now += ms;
    timers.splice(0).forEach(({ callback }) => callback());
    await flush();
  };

  return { asked, timers, shares, settled, waiting, tick };
}

describe('the share of the game kept for offline', () => {
  it('counts the files in, from none before the worker has read the list', () => {
    expect(offlineShare({ ready: false, done: 0, total: 0 })).toEqual({ waiting: true, share: 0 });
    expect(offlineShare({ ready: false, done: 3, total: 4 })).toEqual({
      waiting: true,
      share: 0.75,
    });
  });

  it('waits no more once the game is kept, its download failed, or nothing answered', () => {
    for (const answer of [{ ready: true }, { ready: false, failed: true }, null]) {
      expect(offlineShare(answer)).toEqual({ waiting: false, share: 1 });
    }
  });

  it('stalls only once no file has come in for the whole time', () => {
    const stall = { done: null, since: 0 };

    expect(hasStalled(stall, 0, 0, 1000)).toBe(false);
    expect(hasStalled(stall, 1, 900, 1000)).toBe(false);
    expect(hasStalled(stall, 1, 1800, 1000)).toBe(false);
    expect(hasStalled(stall, 1, 1900, 1000)).toBe(true);
  });
});

describe('waiting for the arcade to keep the game', () => {
  it('asks the worker in the game’s own folder, unstored, until all of it is in', async () => {
    const answer = { value: { ready: false, done: 1, total: 2 } };
    const page = setUp(answer);

    await flush();

    expect(page.asked[0]).toEqual({ url: OFFLINE_PROGRESS, init: { cache: 'no-store' } });
    expect(page.settled.done).toBe(false);
    answer.value = { ready: true };
    await page.tick(250);

    expect(page.shares).toEqual([0.5, 1]);
    expect(page.settled.done).toBe(true);
  });

  it('waits for nothing where nothing answers, or with no fetch at all', async () => {
    const page = setUp({ value: null });
    const shares = [];

    await page.waiting;
    await waitForOffline({ onProgress: (share) => shares.push(share) });

    expect(page.shares).toEqual([1]);
    expect(shares).toEqual([1]);
  });

  it('gives up on a download that stops bringing files in', async () => {
    const page = setUp({ value: { ready: false, done: 1, total: 2 } });

    await flush();
    await page.tick(600);

    expect(page.settled.done).toBe(false);
    await page.tick(600);

    expect(page.settled.done).toBe(true);
  });
});
