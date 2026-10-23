import { describe, expect, it } from 'vitest';
import { FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { addBurst, updateBurst } from '../../../src/sim/summons/bursts.js';

const AT = { ahead: 4, up: 26 };

function spinning() {
  const fighter = { x: 100, y: 180, facing: 1, scale: 2, state: 'attack', move: { whirl: true } };
  const game = { summons: [] };
  addBurst(game, {
    sprite: 'axeWhirl',
    x: 0,
    y: 0,
    scale: 2,
    behind: true,
    follow: { fighter, at: AT, loop: [1, 4], whileMove: 'whirl' },
  });
  return { fighter, burst: game.summons[0] };
}

function tick(burst) {
  burst.time++;
  updateBurst(null, burst);
}

describe('a burst that follows a fighter', () => {
  it('stays on its point of the body, at the fighter`s size, as the fighter moves and turns', () => {
    const { fighter, burst } = spinning();
    fighter.x = 140;
    fighter.facing = -1;
    tick(burst);
    expect(burst).toMatchObject({ x: 132, y: 128, direction: -1 });
  });

  it('loops its middle frames for as long as the move lasts, then plays out', () => {
    const { fighter, burst } = spinning();
    const { ticks, frames } = FX_SPRITES.axeWhirl;
    for (let i = 0; i < 200; i++) {
      tick(burst);
      expect(burst.time).toBeLessThan(5 * ticks);
    }
    expect(burst.done).toBe(false);
    fighter.move = { whirl: false };
    tick(burst);
    expect(burst.time).toBeGreaterThanOrEqual(5 * ticks);
    while (!burst.done) {
      tick(burst);
    }
    expect(burst.time).toBe(frames * ticks);
  });
});
