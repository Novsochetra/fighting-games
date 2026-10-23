import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FX_SCALE, FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { NAGA_MOVES } from '../../../src/data/enemies/moves/naga-moves.js';
import { enemySpriteFrame, timelineFrame } from '../../../src/sim/enemy-animation.js';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { HEAD_MOUTHS } from '../../../src/sim/hazards/naga-bolts.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { readSheet } from '../../support/sheet-cells.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

// Bug: the Naga Raja's effects did not sit on her art. The daze stars of her Spent sag spun some
// thirty pixels over her head, each water naga of the Seven Heads took shape on top of the head
// that spat it and hid it, and in phase two the Tidal Coil's second wave rolled out while she
// stood upright, with no crash of her coil to send it
const originalRandom = Math.random;
const { sprite, image, cellOf } = readSheet('naga');
const UNIT = 2 * sprite.density;
// how far a water naga's tail may still lie over the mouth that spat it, in world pixels
const MOST_OVER_THE_MOUTH = 8;

function moatArena() {
  const game = createPlayingGame();
  game.missionIndex = 10;
  game.arena = { left: 0, right: 384 };
  game.player.x = 120;
  spawnEnemy(game, 'naga', 1);
  const naga = game.boss;
  Object.assign(naga, { entering: false, x: game.player.x + 150, facing: -1 });
  naga.ai.cooldown = 9999;
  return { game, naga };
}

function playOut(game, naga, ticks, everyTick) {
  for (let tick = 1; tick <= ticks; tick++) {
    runTicks(game, 1);
    naga.ai.cooldown = 9999;
    everyTick(tick);
  }
}

// her head's top in her own units above her feet, on a frame of a strip
function headTop(strip, frame) {
  const { left, top, width } = cellOf(strip, frame);
  for (let y = 0; y < sprite.frameHeight; y++) {
    for (let x = 0; x < width; x++) {
      if (image.alpha(left + x, top + y) > 0) {
        return (sprite.feetY - y) / UNIT;
      }
    }
  }
  return 0;
}

describe("the Naga Raja's effects on her art", () => {
  beforeEach(() => {
    Math.random = seededRandom(20);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('rings her sagging head with the daze stars', () => {
    const { up } = NAGA_MOVES.nagaSpent.stars;
    for (const frame of [2, 3]) {
      expect(Math.abs(up - headTop('hurt', frame)), `hurt ${frame}`).toBeLessThanOrEqual(7);
    }
  });

  it('lets each water naga take shape ahead of the head that spits it', () => {
    const { game, naga } = moatArena();
    startMove(game, naga, 'sevenHeads');
    const [at, head] = naga.move.heads[0];
    const [ahead] = HEAD_MOUTHS[timelineFrame(naga.move, at)][head];
    playOut(game, naga, at + 1, () => {});
    const bolt = game.projectiles.find((shot) => shot.kind === 'nagaBolt');
    const tail = bolt.x - naga.facing * FX_SPRITES.nagaBolt.anchorX * FX_SCALE;
    const mouth = naga.x + naga.facing * ahead * naga.scale;
    expect((mouth - tail) * naga.facing).toBeLessThanOrEqual(MOST_OVER_THE_MOUTH);
  });

  it('crashes her coil down for each wave of a double Tidal Coil', () => {
    const { game, naga } = moatArena();
    startMove(game, naga, 'tidalCoils');
    const { tides } = naga.move;
    const shown = new Map();
    const splashes = new Set();
    playOut(game, naga, 100, () => {
      shown.set(naga.moveTime, enemySpriteFrame(naga));
      game.summons
        .filter((burst) => burst.sprite === 'splash')
        .forEach((burst) => splashes.add(burst));
    });
    // the move's clock has already moved on by the time the tick that releases a wave is drawn
    for (const at of tides) {
      expect(shown.get(at + 1), `tick ${at}`).toEqual(['tidalCoil', 5]);
    }
    expect(splashes.size).toBe(tides.length);
  });
});
