import { describe, expect, it } from 'vitest';
import { plainTeams } from '../../../src/sim/plain-teams.js';

describe('the plain sides of a quick match', () => {
  it('fill each format’s formation with players of their slots’ roles', () => {
    const [home, away] = plainTeams('11');

    expect(home.players).toHaveLength(11);
    expect(away.short).toHaveLength(3);
    expect(home.players[0].role).toBe('keeper');
    expect(home.players[9].role).toBe('forward');
    expect(plainTeams('7')[0].players).toHaveLength(7);
  });

  it('are children in 7 v 7, below the older sides', () => {
    const [kids] = plainTeams('7');
    const [older] = plainTeams('11');

    expect(kids.players[6].stats.shot).toBeLessThan(older.players[9].stats.shot);
    expect(kids.players.every((player) => player.stats.speed >= 30)).toBe(true);
  });
});
