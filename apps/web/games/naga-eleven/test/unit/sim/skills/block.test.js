import { describe, expect, it } from 'vitest';
import { throwBlocks } from '../../../../src/sim/skills/block.js';
import { matchInPlay } from '../../../support/match-driver.js';

// a ball struck by team 1's forward toward team 0's goal, passing a defender this far off its line
function struckPast(gap, { kick = 'shot', spirit = 60, x = 300 } = {}) {
  const match = matchInPlay();
  const defender = Object.assign(match.players[2], { x, y: 540 + gap, vx: 0, vy: 0, spirit });

  Object.assign(match.ball, {
    owner: null,
    x: x + 40,
    y: 540,
    z: 2,
    vx: -12,
    vy: 0,
    vz: 0,
    lastTouch: 20,
    kick,
  });
  match.events.length = 0;

  return { match, defender };
}

describe('a block skill', () => {
  it('throws the defender in front of a shot struck past his reach, and it comes off him', () => {
    const { match, defender } = struckPast(24);

    throwBlocks(match);

    expect(match.ball.vx).toBeGreaterThan(0);
    expect(match.ball.lastTouch).toBe(defender.index);
    expect(match.events).toEqual([{ type: 'skill', player: 2, move: 'elephant-guard' }]);
    expect(defender.spirit).toBeLessThan(60);
  });

  it('fires only when it is needed and paid for: not at a ball he reaches anyway', () => {
    for (const fields of [[8], [60], [24, { spirit: 5 }]]) {
      const { match } = struckPast(...fields);

      throwBlocks(match);

      expect(match.events).toEqual([]);
    }
  });

  it('meets a pass only in his own box, where it would find a man to score', () => {
    const outside = struckPast(24, { kick: 'pass', x: 600 });
    const inside = struckPast(24, { kick: 'pass', x: 150 });

    throwBlocks(outside.match);
    throwBlocks(inside.match);

    expect(outside.match.events).toEqual([]);
    expect(inside.match.events).toHaveLength(1);
  });
});
