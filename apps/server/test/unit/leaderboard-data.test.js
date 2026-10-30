import { describe, expect, it } from 'vitest';
import { weekStartOf } from '../../src/arcade-time.js';
import {
  NAME_LIMITS as GAME_LIMITS,
  nameProblem as gameNameProblem,
} from '../../../web/games/steel-and-dust/src/online/player-name.js';
import { cleanName, NAME_LIMITS, nameProblem } from '../../src/leaderboard/read-name.js';
import { readScore, SCORE_LIMITS } from '../../src/leaderboard/read-score.js';
import { createRunTickets, TICKET_LIMITS } from '../../src/leaderboard/run-tickets.js';
import { serializeBoard } from '../../src/leaderboard/serialize-board.js';

const HEROES = [
  { id: 'moss', name: 'Moss Shade' },
  { id: 'bokator', name: 'Bokator' },
];
const RULES = new Map([
  [
    'brawler',
    {
      heroes: HEROES,
      missions: 12,
      difficulties: ['Easy', 'Normal', 'Hard'],
      maxPointsPerSecond: 100,
    },
  ],
]);

const run = (extra) => ({
  game: 'brawler',
  name: 'Sok Dara',
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
      name: 'Sok Dara',
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
    ['no name', { name: '   ' }, /Type your name/],
    ['a name too long', { name: 'A'.repeat(21) }, /at most 20/],
    ['markup in the name', { name: '<b>Sok</b>' }, /letters, numbers/],
    ['a line break', { name: 'Sok\u0000Dara' }, /letters, numbers/],
    ['a name that is a link', { name: 'win-free.xyz' }, /link/],
    ['a name with a slur', { name: 'Fuck You' }, /another name/],
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
    const weekStart = new Date('2026-10-25T17:00:00Z');
    const json = JSON.parse(serializeBoard({ week: [saved], allTime: [] }, { weekStart }));
    expect(json.weekStart).toBe('2026-10-26');
    expect(json.allTime).toEqual([]);
    expect(json.week).toEqual([
      {
        name: 'Sok Dara',
        score: 4200,
        mission: 3,
        hero: 'bokator',
        difficulty: 1,
        seconds: 300,
        cleared: false,
        date: '2026-10-29',
        poster: null,
      },
    ]);
  });

  it("sends a run's poster in each of its sizes, only while the arcade keeps its files", () => {
    const saved = { ...run(), id: 7, createdAt: new Date(), poster: 'posters/brawler/abc123' };
    const storage = { urlOf: (key) => `https://files.example.test/${key}` };
    const board = { week: [saved], allTime: [] };
    const weekStart = new Date('2026-10-25T17:00:00Z');
    const kept = JSON.parse(serializeBoard(board, { weekStart, storage })).week[0].poster;
    expect(kept).toEqual([
      { width: 320, url: 'https://files.example.test/posters/brawler/abc123-320.jpg' },
      { width: 640, url: 'https://files.example.test/posters/brawler/abc123-640.jpg' },
      { width: 1200, url: 'https://files.example.test/posters/brawler/abc123-1200.png' },
    ]);
    expect(JSON.parse(serializeBoard(board, { weekStart })).week[0].poster).toBeNull();
  });
});

describe('a player name', () => {
  it('is cleaned of extra spaces and composed as one form', () => {
    expect(cleanName('  Sok   Dara  ')).toBe('Sok Dara');
    expect(cleanName('Amélie')).toBe('Amélie');
    expect(cleanName(42)).toBe('');
  });

  it.each([
    'Sok Dara',
    'សុខ ដារ៉ា',
    'Dara_07',
    "O'Neil",
    'Jean-Luc',
    'Mr. Tep',
    'Cassandra',
    'Dickson',
  ])('takes %j', (name) => {
    expect(nameProblem(cleanName(name))).toBeNull();
  });

  it('counts a name by code point, as Postgres does', () => {
    expect(nameProblem('ក'.repeat(NAME_LIMITS.maxLength))).toBeNull();
    expect(nameProblem('ក'.repeat(NAME_LIMITS.maxLength + 1))).toMatch(/at most/);
  });

  it.each([
    ['a tag', '<script>', /letters, numbers/],
    ['an emoji', 'Sok 🔥', /letters, numbers/],
    ['a web address', 'www.free-gems', /link/],
    ['a domain', 'gems.com', /link/],
    ['a slur', 'nigga', /another name/],
    ['a slur spelled out with gaps', 'f u c k', /another name/],
    ['a slur inside a word', 'fuckboy', /another name/],
    ['a Khmer slur', 'ចុយម្ដាយ', /another name/],
  ])('turns away %s', (_label, name, problem) => {
    expect(nameProblem(cleanName(name))).toMatch(problem);
  });
});

// Steel & Dust's post panel checks a name before sending it; the server has the last word, so the
// panel must never pass a name the server would turn away for its length or its letters, nor stop
// one it would take (the words the server blocks are its own to know)
describe("Steel & Dust's own name check", () => {
  it('holds the same limits as the server', () => {
    expect(GAME_LIMITS).toEqual(NAME_LIMITS);

    for (const name of ['Sok', 'សុខ ដារ៉ា', 'a'.repeat(20), 'a'.repeat(21), '<b>', 'Sok 🔥', '']) {
      expect(gameNameProblem(name) === null, name).toBe(nameProblem(name) === null);
    }
  });
});
