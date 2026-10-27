import { describe, expect, it, vi } from 'vitest';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { creditLines } from '../../../src/ui/credits/credit-lines.js';
import { rollPath, SCREEN_SECONDS } from '../../../src/ui/credits/roll-path.js';
import { creditedSupporters, readSupporterList } from '../../../src/ui/credits/supporter-list.js';
import { createSupportersFeed } from '../../../src/ui/credits/supporters-feed.js';

// a gift as the arcade's API sends it, its tier named by the server
const gift = (name, amount, tier = 'bronze', date = '2026-10-20') => ({
  name,
  amount,
  tier,
  date,
  message: '',
});
// a gift from a list kept offline from before the API named tiers
const untiered = (name, amount) => ({ name, amount, date: '2026-10-20', message: '' });
const texts = (lines, kind) => lines.filter((line) => line.kind === kind).map((line) => line.text);
const invites = (lines) => lines.filter((line) => line.kind === 'invite');
const read = (supporters) => readSupporterList({ supporters });
const LINK = { href: '../../supporters/', text: 'khmerarcade.games/supporters' };
const invite = (text) => ({ kind: 'invite', text, sub: 'Support the arcade at', link: LINK });

// the supporters' part of the credits, from its heading to the invite, as kind: text
function supportersPart(lines) {
  const start = lines.findIndex((line) => line.text === 'Supporters');

  return lines.slice(start + 1, -1).map((line) => `${line.kind}: ${line.text}`);
}

describe('reading the supporters list', () => {
  it('keeps each gift with its name, amount in cents, tier and day', () => {
    const json = {
      currency: 'USD',
      supporters: [gift(' Sok Dara ', 25.5, 'diamond'), gift('', 5, 'silver')],
    };

    expect(readSupporterList(json)).toEqual([
      { name: 'Sok Dara', cents: 2550, tier: 'diamond', date: '2026-10-20' },
      { name: '', cents: 500, tier: 'silver', date: '2026-10-20' },
    ]);
  });

  it('keeps a gift whose tier it does not know, without one', () => {
    expect(read([gift('Dara', 5, 'platinum'), untiered('Chan', 5)])).toEqual([
      { name: 'Dara', cents: 500, tier: null, date: '2026-10-20' },
      { name: 'Chan', cents: 500, tier: null, date: '2026-10-20' },
    ]);
  });

  it('drops gifts with no amount above zero or no day, and a name that is not text', () => {
    const supporters = [
      gift('Zero', 0),
      gift('Odd', '5'),
      gift('Undated', 5, 'silver', 'soon'),
      gift(7, 3),
      null,
    ];

    expect(read(supporters)).toEqual([
      { name: '', cents: 300, tier: 'bronze', date: '2026-10-20' },
    ]);
  });

  it('reads anything that is not a list as no list', () => {
    expect(readSupporterList(null)).toBeNull();
    expect(readSupporterList({ supporters: 'many' })).toBeNull();
  });
});

describe('the supporters the credits name', () => {
  const credited = (supporters) => creditedSupporters(read(supporters));

  it('groups them by tier, the highest first, leaving out a tier no one reached', () => {
    const groups = credited([
      gift('Vanna', 5, 'silver'),
      gift('Dara', 25, 'diamond'),
      gift('Chan', 1, 'bronze'),
    ]);

    expect(groups).toEqual([
      { tier: 'diamond', names: ['Dara'], anonymous: 0 },
      { tier: 'silver', names: ['Vanna'], anonymous: 0 },
      { tier: 'bronze', names: ['Chan'], anonymous: 0 },
    ]);
  });

  it('puts the most given first in a tier, and the earliest first among equals', () => {
    const [bronze] = credited([
      gift('Thea Han', 1, 'bronze', '2026-10-26'),
      gift('Tith Sothea', 3, 'bronze', '2026-10-27'),
      gift('Phy RithVireak', 1, 'bronze', '2026-10-27'),
    ]);

    expect(bronze.names).toEqual(['Tith Sothea', 'Thea Han', 'Phy RithVireak']);
  });

  it('names a supporter who gave twice once, under the highest tier they reached', () => {
    const groups = credited([
      gift('Dara', 5, 'silver'),
      gift('Chan', 8, 'silver'),
      gift('Dara', 10, 'gold'),
    ]);

    expect(groups.map(({ tier, names }) => [tier, names])).toEqual([
      ['gold', ['Dara']],
      ['silver', ['Chan']],
    ]);
  });

  it('counts the gifts made without a name in their own tier', () => {
    const groups = credited([gift('', 25, 'diamond'), gift('Dara', 1), gift('', 2)]);

    expect(groups).toEqual([
      { tier: 'diamond', names: [], anonymous: 1 },
      { tier: 'bronze', names: ['Dara'], anonymous: 1 },
    ]);
  });

  it('puts gifts with no tier last, as a list kept offline from before the API named them', () => {
    const groups = credited([untiered('Dara', 5), gift('Chan', 25, 'diamond')]);

    expect(groups.map(({ tier, names }) => [tier, names])).toEqual([
      ['diamond', ['Chan']],
      [null, ['Dara']],
    ]);
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

  it('heads each tier with its name, the highest first, its supporters under it', () => {
    const all = lines(
      read([
        gift('Kanitha', 23, 'gold'),
        gift('Kanha Tor', 5, 'silver'),
        gift('Thea Han', 1, 'bronze'),
        gift('Tith Sothea', 3, 'bronze'),
      ]),
    );

    expect(supportersPart(all)).toEqual([
      'note: They keep every game free',
      'tier: Gold',
      'name: Kanitha',
      'tier: Silver',
      'name: Kanha Tor',
      'tier: Bronze',
      'name: Tith Sothea',
      'name: Thea Han',
      'invite: Want your name here?',
    ]);
    expect(all).toContainEqual({ kind: 'tier', text: 'Gold', tier: 'gold' });
  });

  it("counts a tier's anonymous supporters after its names, or on their own", () => {
    const all = lines(read([gift('សុខ ចាន់', 10, 'gold'), gift('', 5, 'silver'), gift('Dara', 1)]));
    const bronze = lines(read([gift('Dara', 1), gift('', 1), gift('', 2)]));

    expect(all).toContainEqual({ kind: 'name', text: 'សុខ ចាន់', lang: 'km' });
    expect(supportersPart(all).slice(3, 5)).toEqual([
      'tier: Silver',
      'note: 1 anonymous supporter',
    ]);
    expect(texts(bronze, 'note')).toContain('and 2 anonymous supporters');
  });

  it('lists gifts with no tier without a heading', () => {
    expect(supportersPart(lines(read([untiered('Dara', 5)])))).toEqual([
      'note: They keep every game free',
      'name: Dara',
      'invite: Want your name here?',
    ]);
  });

  it('marks only a Khmer name as Khmer', () => {
    expect(lines(read([gift('Dara', 5)]))).toContainEqual({ kind: 'name', text: 'Dara' });
  });

  it('ends the supporters on how to join them, with the way to the supporters page', () => {
    const all = lines(read([gift('Dara', 5)]));

    expect(invites(all)).toEqual([invite('Want your name here?')]);
    expect(all.at(-2).kind).toBe('invite');
  });

  it('asks for the first supporter while there is none', () => {
    const all = lines([]);

    expect(texts(all, 'note')).toEqual(['No supporters yet']);
    expect(invites(all)).toEqual([invite('Be the first name here')]);
  });

  it('thanks everyone when the list could not be read, and still says how to join', () => {
    const all = lines(null);

    expect(texts(all, 'note')).toEqual(['Thank you to everyone who keeps the arcade free']);
    expect(invites(all)).toEqual([invite('Want your name here?')]);
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
    expect(feed.gifts).toEqual([{ name: 'Dara', cents: 500, tier: 'bronze', date: '2026-10-20' }]);
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

      expect(feed.gifts).toEqual([
        { name: 'Dara', cents: 500, tier: 'bronze', date: '2026-10-20' },
      ]);
    });
  });
});
