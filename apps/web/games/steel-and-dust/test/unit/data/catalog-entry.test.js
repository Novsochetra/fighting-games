import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DIFFICULTIES } from '../../../src/data/difficulty.js';
import { HEROES } from '../../../src/data/heroes.js';
import { MISSIONS } from '../../../src/data/missions/index.js';

const entry = JSON.parse(readFileSync(join(import.meta.dirname, '../../../game.json'), 'utf8'));

// the server checks each posted score against these rules, so they must say what the game is
describe('the leaderboard rules in game.json', () => {
  it('name every hero, mission and difficulty the game has', () => {
    expect(entry.leaderboard.heroes).toEqual(HEROES.map((hero) => hero.id));
    expect(entry.leaderboard.missions).toBe(MISSIONS.length);
    expect(entry.leaderboard.difficulties).toBe(DIFFICULTIES.length);
  });

  // a real run walks between its fights, so it scores slower than the recorded bots, which fight
  // all the way; three times their best pace leaves room for a player better than them
  it('let a second of play earn three times what the hardest-hitting recorded run did', () => {
    const fixtures = join(import.meta.dirname, '../../regression/fixtures');
    const paces = readdirSync(fixtures)
      .filter((name) => name.startsWith('scenario-'))
      .map((name) => readFileSync(join(fixtures, name), 'utf8'))
      .map((text) => {
        const scores = [...text.matchAll(/"score": (\d+)/g)].map((match) => Number(match[1]));
        const ticks = [...text.matchAll(/"tick": (\d+)/g)].map((match) => Number(match[1]));
        return Math.max(0, ...scores) / (Math.max(1, ...ticks) / 60);
      });
    expect(Math.max(...paces)).toBeGreaterThan(100);
    expect(entry.leaderboard.maxPointsPerSecond).toBeGreaterThanOrEqual(3 * Math.max(...paces));
  });
});
