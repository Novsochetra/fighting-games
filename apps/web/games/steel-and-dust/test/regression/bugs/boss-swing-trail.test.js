import { describe, expect, it } from 'vitest';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

// Bug: a boss's swipe and slam drew the raiders' white weapon trail along a weapon its sprite does
// not hold where the trail thought: a straight bar across the Djinn's lightning, a line cutting
// through the Colossus. A boss sheet draws its own arc, so only raiders leave the trail
function longestTrail(kind, move) {
  const game = createPlayingGame();
  game.player.x = 100;
  game.player.invincible = 9999;
  spawnEnemy(game, kind, 1);
  const fighter = game.fighters.find((one) => one.kind === kind);
  Object.assign(fighter, { entering: false, x: 140, facing: -1 });
  fighter.ai.cooldown = 9999;
  startMove(game, fighter, move);
  let longest = 0;
  for (let i = 0; i < 60; i++) {
    runTicks(game, 1);
    fighter.ai.cooldown = 9999;
    longest = Math.max(longest, fighter.trail.length);
  }
  return longest;
}

describe('a swing’s weapon trail', () => {
  it.each(['khan', 'colossus', 'gnoll', 'djinn', 'furnace'])(
    'is left out for the %s, whose sheet draws its own arc',
    (kind) => {
      expect(longestTrail(kind, 'swipe')).toBe(0);
      expect(longestTrail(kind, 'slam')).toBe(0);
    },
  );

  it('is still left by a raider', () => {
    expect(longestTrail('grunt', 'punch')).toBeGreaterThan(0);
  });
});
