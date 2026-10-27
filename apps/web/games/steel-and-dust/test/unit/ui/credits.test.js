import { describe, expect, it, vi } from 'vitest';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { creditLines } from '../../../src/ui/credits/credit-lines.js';
import { rollPath, SCREEN_SECONDS } from '../../../src/ui/credits/roll-path.js';
import { creditedSupporters, readSupporterList } from '../../../src/ui/credits/supporter-list.js';
import { createSupportersFeed } from '../../../src/ui/credits/supporters-feed.js';

const gift = (name, amount, date = '2026-10-20') => ({ name, amount, date, message: '' });
const texts = (lines, kind) => lines.filter((line) => line.kind === kind).map((line) => line.text);
const invites = (lines) => lines.filter((line) => line.kind === 'invite');
const SUPPORT = 'Support the arcade at khmerarcade.games';

describe('reading the supporters list', () => {
  it('keeps each gift with its name, amount in cents and day', () => {
    const json = { currency: 'USD', supporters: [gift(' Sok Dara ', 25.5), gift('', 5)] };

    expect(readSupporterList(json)).toEqual([
      { name: 'Sok Dara', cents: 2550, date: '2026-10-20' },
      { name: '', cents: 500, date: '2026-10-20' },
    ]);
  });

  it('drops gifts with no amount above zero or no day, and a name that is not text', () => {
    const json = {
      supporters: [gift('Zero', 0), gift('Odd', '5'), gift('Undated', 5, 'soon'), gift(7, 3), null],
    };

    expect(readSupporterList(json)).toEqual([{ name: '', cents: 300, date: '2026-10-20' }]);
  });

  it('reads anything that is not a list as no list', () => {
    expect(readSupporterList(null)).toBeNull();
    expect(readSupporterList({ supporters: 'many' })).toBeNull();
  });
});

describe('the supporters the credits name', () => {
  const read = (supporters) => creditedSupporters(readSupporterList({ supporters }));

  it('puts the most given first, and the earliest first among equals', () => {
    const credited = read([
      gift('Vanna', 5, '2026-10-02'),
      gift('Dara', 25, '2026-10-09'),
      gift('Chan', 5, '2026-10-01'),
    ]);

    expect(credited).toEqual({ names: ['Dara', 'Chan', 'Vanna'], anonymous: 0 });
  });

  it('names a supporter who gave twice once, by all they gave', () => {
    const credited = read([gift('Dara', 10), gift('Chan', 15), gift('Dara', 10)]);

    expect(credited.names).toEqual(['Dara', 'Chan']);
  });

  it('counts the gifts made without a name instead of listing them', () => {
    expect(read([gift('', 5), gift('Dara', 1), gift('', 2)])).toEqual({
      names: ['Dara'],
      anonymous: 2,
    });
  });
});

describe('the credit lines', () => {
  const lines = (gifts, heroId = 'ember') => creditLines({ heroId, gifts });

  it('opens on the game, the Shade who won and its maker, and ends on the thanks', () => {
    const all = lines([]);

    expect(all[0]).toEqual({ kind: 'logo', text: 'Steel & Dust', sub: 'pixel brawler' });
    expect(all).toContainEqual({ kind: 'hero', text: 'Ember Shade', hero: 'ember' });
    expect(texts(all, 'heading')).toEqual(['Starring', 'Created by', 'Supporters']);
    expect(texts(all, 'name')).toEqual(['Nov Sochetra']);
    expect(all.at(-1)).toEqual({ kind: 'finale', text: 'Thank you for playing' });
  });

  it('names every supporter under their heading, then the anonymous ones', () => {
    const all = lines(readSupporterList({ supporters: [gift('សុខ ចាន់', 10), gift('', 5)] }));
    const supporters = all.slice(all.findIndex((line) => line.text === 'Supporters'));

    expect(supporters).toContainEqual({ kind: 'name', text: 'សុខ ចាន់', lang: 'km' });
    expect(texts(supporters, 'note')).toEqual([
      'They keep every game free',
      'and 1 anonymous supporter',
    ]);
  });

  it('ends the supporters on how to join them, plainly: a gift on the arcade', () => {
    const all = lines(readSupporterList({ supporters: [gift('Dara', 5)] }));

    expect(invites(all)).toEqual([{ kind: 'invite', text: 'Want your name here?', sub: SUPPORT }]);
    expect(all.at(-2).kind).toBe('invite');
  });

  it('marks only a Khmer name as Khmer', () => {
    const all = lines(readSupporterList({ supporters: [gift('Dara', 5)] }));

    expect(all).toContainEqual({ kind: 'name', text: 'Dara' });
  });

  it('counts anonymous supporters on their own when no one gave a name', () => {
    const all = lines(readSupporterList({ supporters: [gift('', 5), gift('', 5)] }));

    expect(texts(all, 'note')).toContain('2 anonymous supporters');
  });

  it('asks for the first supporter while there is none', () => {
    const all = lines([]);

    expect(texts(all, 'note')).toEqual(['No supporters yet']);
    expect(invites(all)).toEqual([
      { kind: 'invite', text: 'Be the first name here', sub: SUPPORT },
    ]);
  });

  it('thanks everyone when the list could not be read, and still says how to join', () => {
    const all = lines(null);

    expect(texts(all, 'note')).toEqual(['Thank you to everyone who keeps the arcade free']);
    expect(invites(all)).toEqual([{ kind: 'invite', text: 'Want your name here?', sub: SUPPORT }]);
  });
});

describe('the path of the roll', () => {
  it('rises from under the screen until the finale stands in the middle', () => {
    const path = rollPath({ windowHeight: 400, finaleCenter: 1000 });

    expect(path).toMatchObject({ from: 400, to: 200 - 1000 });
    expect(path.seconds).toBeCloseTo(((400 + 800) / 400) * SCREEN_SECONDS);
  });

  it('rolls a longer list for longer at the same speed', () => {
    const short = rollPath({ windowHeight: 400, finaleCenter: 600 });
    const long = rollPath({ windowHeight: 400, finaleCenter: 1400 });

    expect(long.seconds - short.seconds).toBeCloseTo((800 / 400) * SCREEN_SECONDS);
  });

  it('still ends when the window has no height yet', () => {
    expect(Number.isFinite(rollPath({ windowHeight: 0, finaleCenter: 0 }).seconds)).toBe(true);
  });
});

describe('the supporters feed', () => {
  const answer = (json, ok = true) => vi.fn(async () => ({ ok, json: async () => json }));

  it('reads the arcade list from the arcade root', async () => {
    const fetch = answer({ supporters: [gift('Dara', 5)] });
    const feed = createSupportersFeed(fetch);

    await feed.load();

    expect(fetch).toHaveBeenCalledWith('../../api/supporters');
    expect(feed.gifts).toEqual([{ name: 'Dara', cents: 500, date: '2026-10-20' }]);
  });

  it('keeps no list when the server fails or cannot be reached', async () => {
    const failing = createSupportersFeed(answer({}, false));
    const offline = createSupportersFeed(
      vi.fn(async () => Promise.reject(new TypeError('offline'))),
    );

    await failing.load();
    await offline.load();

    expect(failing.gifts).toBeNull();
    expect(offline.gifts).toBeNull();
  });

  describe('following the run', () => {
    const LAST = MISSIONS.length - 1;
    const run = (missionIndex, { lootTime = 0, clearTime = 0 } = {}) => ({
      missionIndex,
      lootTime,
      clearTime,
    });

    it('reads the list again once, as the last boss falls', () => {
      const fetch = answer({ supporters: [] });
      const feed = createSupportersFeed(fetch);

      feed.followRun(run(LAST));
      feed.followRun(run(LAST, { lootTime: 1 }));
      feed.followRun(run(LAST, { lootTime: 300 }));
      feed.followRun(run(LAST, { clearTime: 40 }));

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('leaves the list alone when an earlier boss falls', () => {
      const fetch = answer({ supporters: [] });
      const feed = createSupportersFeed(fetch);

      feed.followRun(run(LAST - 1, { lootTime: 1 }));
      feed.followRun(run(0, { clearTime: 40 }));

      expect(fetch).not.toHaveBeenCalled();
    });

    it('reads it again at the end of the next run', () => {
      const fetch = answer({ supporters: [] });
      const feed = createSupportersFeed(fetch);

      feed.followRun(run(LAST, { clearTime: 40 }));
      feed.followRun(run(0));
      feed.followRun(run(LAST, { lootTime: 1 }));

      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('keeps the list read before when the read at the end fails', async () => {
      const fetch = answer({ supporters: [gift('Dara', 5)] });
      const feed = createSupportersFeed(fetch);

      await feed.load();
      fetch.mockRejectedValueOnce(new TypeError('offline'));
      await feed.load();

      expect(feed.gifts).toEqual([{ name: 'Dara', cents: 500, date: '2026-10-20' }]);
    });
  });
});
