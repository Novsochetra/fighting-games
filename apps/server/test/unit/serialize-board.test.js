import { describe, expect, it } from 'vitest';
import { serializeBoard } from '../../src/leaderboard/serialize-board.js';

const run = (extra) => ({
  game: 'brawler',
  name: 'Sok Dara',
  score: 4200,
  mission: 3,
  hero: 'bokator',
  difficulty: 1,
  seconds: 300,
  cleared: false,
  ...extra,
});

const KEY = 'posters/brawler/0123456789abcdef01234567';

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

  it("sends a run's avatar and poster sizes, only while the arcade keeps its files", () => {
    const saved = { ...run(), id: 7, createdAt: new Date(), poster: KEY };
    const storage = { urlOf: (key) => `https://files.example.test/${key}` };
    const board = { week: [saved], allTime: [] };
    const weekStart = new Date('2026-10-25T17:00:00Z');
    const kept = JSON.parse(serializeBoard(board, { weekStart, storage })).week[0].poster;
    expect(kept).toEqual({
      avatar: 'https://files.example.test/posters/brawler/0123456789abcdef01234567-192.jpg',
      images: [
        {
          width: 640,
          url: 'https://files.example.test/posters/brawler/0123456789abcdef01234567-640.jpg',
        },
        {
          width: 1200,
          url: 'https://files.example.test/posters/brawler/0123456789abcdef01234567-1200.png',
        },
      ],
    });
    expect(JSON.parse(serializeBoard(board, { weekStart })).week[0].poster).toBeNull();
  });

  it.each([
    ['a row id typed in by hand', '1'],
    ["another game's key", 'posters/puzzle/0123456789abcdef01234567'],
    ['a name too short', 'posters/brawler/abc123'],
    ['a whole address', `https://files.example.test/${KEY}`],
  ])(
    'sends no poster for %s, rather than addresses of files that are not there',
    (_label, poster) => {
      const saved = { ...run(), id: 7, createdAt: new Date(), poster };
      const storage = { urlOf: (key) => `https://files.example.test/${key}` };
      const weekStart = new Date('2026-10-25T17:00:00Z');
      const json = serializeBoard({ week: [saved], allTime: [] }, { weekStart, storage });
      expect(JSON.parse(json).week[0].poster).toBeNull();
    },
  );
});
