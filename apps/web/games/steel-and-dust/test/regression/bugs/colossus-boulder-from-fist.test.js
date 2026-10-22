import { describe, expect, it } from 'vitest';
import { RENDER_SCALE } from '../../../src/config.js';
import { ENEMY_SPRITES } from '../../../src/data/enemies/enemy-sprites.js';
import { enemySpriteFrame } from '../../../src/sim/enemy-animation.js';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { readPngAlpha } from '../../support/png-alpha.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const GAME = new URL('../../../', import.meta.url);

// the front of the art on a frame, in the boss's own units from its feet, above a height
function frontAbove(strip, frame, up) {
  const sprite = ENEMY_SPRITES.colossus;
  const sheet = readPngAlpha(new URL(`assets/sprites/enemies/${sprite.file}`, GAME));
  const top = sprite.strips[strip].row * sprite.frameHeight;
  let front = -Infinity;
  for (let y = 0; y < sprite.feetY - up * RENDER_SCALE; y++) {
    for (let x = 0; x < sprite.frameWidth; x++) {
      if (sheet.alpha(frame * sprite.frameWidth + x, top + y) > 40) {
        front = Math.max(front, (x - sprite.feetX) / RENDER_SCALE);
      }
    }
  }
  return front;
}

// Bug: the Rust Colossus's boulder appeared in the air over his head, where neither the frame that
// holds it nor the throwing frame draws it, a tick after the throwing frame showed empty hands, and
// half the size of the boulder he lifts
describe("the Rust Colossus's Boulder Lob", () => {
  it('leaves his fist on the tick the throwing frame thrusts it forward, as big as he lifts it', () => {
    const game = createPlayingGame();
    game.arena = { left: 0, right: 384 };
    game.player.x = 60;
    spawnEnemy(game, 'colossus', 1);
    const colossus = game.boss;
    Object.assign(colossus, { entering: false, x: 300, facing: -1 });
    colossus.ai.cooldown = 9999;
    startMove(game, colossus, 'boulderLob');
    runTicks(game, colossus.move.startup);
    expect(game.projectiles.some((shot) => shot.kind === 'boulder')).toBe(false);
    const holding = enemySpriteFrame(colossus);
    runTicks(game, 1);
    const throwing = enemySpriteFrame(colossus);
    expect(throwing).not.toEqual(holding);
    const boulder = game.projectiles.find((shot) => shot.kind === 'boulder');
    const fist = frontAbove(...throwing, 30);
    const ahead = (colossus.x - boulder.x) / colossus.scale;
    expect(Math.abs(ahead - fist)).toBeLessThan(4);
    expect(boulder.size).toBeGreaterThanOrEqual(colossus.scale);
  });
});
