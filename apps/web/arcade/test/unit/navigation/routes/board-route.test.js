import { describe, expect, it } from 'vitest';
import { boardRoute, pickedGame } from '@/navigation/routes/board-route.js';

describe("a game's board address", () => {
  it('names the game, or none', () => {
    expect(boardRoute('steel-and-dust')).toBe('/leaderboard/?game=steel-and-dust');
    expect(boardRoute(null)).toBe('/leaderboard/');
  });

  it('picks the game asked for, or else the first with a board', () => {
    const games = [{ id: 'a' }, { id: 'b' }];
    expect(pickedGame(games, 'b')).toBe(games[1]);
    expect(pickedGame(games, 'zzz')).toBe(games[0]);
    expect(pickedGame([], 'a')).toBeNull();
  });
});
