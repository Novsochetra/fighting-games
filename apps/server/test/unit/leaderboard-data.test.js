import { describe, expect, it } from 'vitest';
import { weekStartOf } from '../../src/arcade-time.js';
import { readScore, SCORE_LIMITS } from '../../src/leaderboard/read-score.js';
import { createRunTickets, TICKET_LIMITS } from '../../src/leaderboard/run-tickets.js';
import { serializeBoard } from '../../src/leaderboard/serialize-board.js';

const RULES = new Map([
  [
    'brawler',
    { heroes: ['moss', 'bokator'], missions: 12, difficulties: 3, maxPointsPerSecond: 100 },
  ],
]);

const run = (extra) => ({
  game: 'brawler',
  initials: 'SOK',
  score: 4200,
  mission: 3,
  hero: 'bokator',
  difficulty: 1,
  seconds: 300,
  cleared: false,
  ticket: 'a-ticket',
  ...extra,
});

describe('readScore', () => {
  it('keeps a run the game could have played, and its ticket apart from it', () => {
    const { run: read, ticket } = readScore(run(), RULES);
    expect(ticket).toBe('a-ticket');
    expect(read).toEqual({
      game: 'brawler',
      initials: 'SOK',
      score: 4200,
      mission: 3,
      hero: 'bokator',
      difficulty: 1,
      seconds: 300,
      cleared: false,
    });
  });

  it('drops fields the server never stores', () => {
    expect(readScore(run({ admin: true, hidden: true }), RULES).run).not.toHaveProperty('hidden');
  });

  it.each([
    ['a game with no board', { game: 'puzzle' }, /no leaderboard/],
    ['lowercase initials', { initials: 'sok' }, /3 letters/],
    ['four letters', { initials: 'SOKH' }, /3 letters/],
    ['initials with markup', { initials: '<b>' }, /3 letters/],
    ['no score', { score: 0 }, /whole number/],
    ['a fractional score', { score: 10.5 }, /whole number/],
    ['a score as text', { score: '4200' }, /whole number/],
    ['a huge score', { score: SCORE_LIMITS.maxScore + 1 }, /whole number/],
    ['a mission past the last', { mission: 13 }, /mission/],
    ['mission zero', { mission: 0 }, /mission/],
    ['a hero the game lacks', { hero: 'ninja' }, /hero/],
    ['a difficulty the game lacks', { difficulty: 3 }, /difficulty/],
    ['negative time', { seconds: -1 }, /seconds/],
    ['a day and more of play', { seconds: SCORE_LIMITS.maxSeconds + 1 }, /seconds/],
    ['cleared as text', { cleared: 'yes' }, /cleared/],
    ['no ticket', { ticket: undefined }, /ticket/],
    ['a giant ticket', { ticket: 'x'.repeat(SCORE_LIMITS.maxTicketLength + 1) }, /ticket/],
    ['a clear short of the last mission', { cleared: true, mission: 11 }, /last one/],
    ['more points than the time could earn', { score: 36001, seconds: 300 }, /time played/],
    ['initials that spell a slur', { initials: 'FUK' }, /other initials/],
  ])('refuses %s', (_label, extra, message) => {
    expect(readScore(run(extra), RULES).error).toMatch(message);
  });

  it('gives a short run its first minute of points', () => {
    expect(readScore(run({ score: 6000, seconds: 0 }), RULES).error).toBeUndefined();
    expect(readScore(run({ score: 6001, seconds: 0 }), RULES).error).toMatch(/time played/);
  });

  it('takes a run that cleared the last mission', () => {
    expect(readScore(run({ cleared: true, mission: 12 }), RULES).error).toBeUndefined();
  });

  it('refuses what is not an object', () => {
    expect(readScore(null, RULES).error).toMatch(/no leaderboard/);
    expect(readScore([], RULES).error).toMatch(/no leaderboard/);
  });
});

describe('run tickets', () => {
  const MINUTE = 60 * 1000;

  function clockedTickets(secret = 'secret') {
    const clock = { time: Date.UTC(2026, 9, 29) };
    return { clock, tickets: createRunTickets({ secret, now: () => clock.time }) };
  }

  it('takes a ticket it gave, as old as the time the run claims', () => {
    const { clock, tickets } = clockedTickets();
    const ticket = tickets.issue();
    clock.time += 10 * MINUTE;
    const checked = tickets.check(ticket, 10 * 60);
    expect(checked.error).toBeUndefined();
    expect(checked.nonce).toMatch(/^[\w-]{16}$/);
  });

  it('gives every ticket its own nonce', () => {
    const { tickets } = clockedTickets();
    const nonces = new Set(
      Array.from({ length: 50 }, () => tickets.check(tickets.issue(), 0).nonce),
    );
    expect(nonces.size).toBe(50);
  });

  it('refuses a run that claims more play than has passed since its ticket', () => {
    const { clock, tickets } = clockedTickets();
    const ticket = tickets.issue();
    clock.time += 10 * MINUTE;
    const claimed = (10 * MINUTE + TICKET_LIMITS.slackMs) / 1000 + 1;
    expect(tickets.check(ticket, claimed).error).toMatch(/faster than the clock/);
  });

  it('refuses a ticket too old to post', () => {
    const { clock, tickets } = clockedTickets();
    const ticket = tickets.issue();
    clock.time += TICKET_LIMITS.maxAgeMs + 1;
    expect(tickets.check(ticket, 0).error).toMatch(/too old/);
  });

  it('refuses a ticket dated in the future', () => {
    const { clock, tickets } = clockedTickets();
    const ticket = tickets.issue();
    clock.time -= MINUTE;
    expect(tickets.check(ticket, 0).error).toMatch(/too old/);
  });

  it('refuses a ticket with its time moved back, or signed with another secret', () => {
    const { clock, tickets } = clockedTickets();
    const [issuedAt, nonce, mac] = tickets.issue().split('.');
    const backdated = [Number(issuedAt) - 60 * MINUTE, nonce, mac].join('.');
    clock.time += MINUTE;
    expect(tickets.check(backdated, 3000).error).toMatch(/not one this arcade gave/);
    const forged = clockedTickets('another secret').tickets.issue();
    expect(tickets.check(forged, 0).error).toMatch(/not one this arcade gave/);
  });

  it.each(['', 'junk', '1.2.3', `${'9'.repeat(13)}.${'a'.repeat(16)}.${'b'.repeat(43)}`])(
    'refuses the made-up ticket %j',
    (ticket) => {
      expect(clockedTickets().tickets.check(ticket, 0).error).toMatch(/not one this arcade gave/);
    },
  );
});

describe('weekStartOf', () => {
  it('starts the week at midnight on Monday in Phnom Penh', () => {
    const monday = new Date('2026-10-25T17:00:00Z');
    expect(weekStartOf(new Date('2026-10-29T05:00:00Z'))).toEqual(monday);
    expect(weekStartOf(monday)).toEqual(monday);
    expect(weekStartOf(new Date('2026-11-01T16:59:59Z'))).toEqual(monday);
  });

  it('moves to the next week as Monday comes in Cambodia, not in UTC', () => {
    expect(weekStartOf(new Date('2026-11-01T17:00:00Z'))).toEqual(new Date('2026-11-01T17:00:00Z'));
    expect(weekStartOf(new Date('2026-10-25T16:59:59Z'))).toEqual(new Date('2026-10-18T17:00:00Z'));
  });
});

describe('serializeBoard', () => {
  it('sends each run with the day it was played in Phnom Penh, and nothing kept behind', () => {
    const saved = {
      ...run(),
      id: 7,
      ticket: 'secret-nonce',
      createdAt: new Date('2026-10-28T18:30:00Z'),
    };
    const json = JSON.parse(
      serializeBoard({ week: [saved], allTime: [] }, new Date('2026-10-25T17:00:00Z')),
    );
    expect(json.weekStart).toBe('2026-10-26');
    expect(json.allTime).toEqual([]);
    expect(json.week).toEqual([
      {
        initials: 'SOK',
        score: 4200,
        mission: 3,
        hero: 'bokator',
        difficulty: 1,
        seconds: 300,
        cleared: false,
        date: '2026-10-29',
      },
    ]);
  });
});
