import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PHARAOH_MOVES } from '../../../src/data/enemies/moves/pharaoh-moves.js';
import { enemySpriteFrame } from '../../../src/sim/enemy-animation.js';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { readSheet } from '../../support/sheet-cells.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

// Bug: once his flinch was redrawn, the reel Sun Broken leaves him in rocked between a frame thrown
// back and one hunched forward, his head jumping some twenty pixels to and fro six times a second,
// and the daze stars spun over his chest instead of round his head
const originalRandom = Math.random;
const { sprite, image, cellOf } = readSheet('pharaoh');
const UNIT = 2 * (sprite.density ?? 1);
// his staff stands out in front of him; his head is the top of the art behind it
const HEAD_COLUMNS = sprite.feetX + 8;
const HEAD_ROWS = 10;

function drawnColumns(cell, y) {
  const columns = [];
  for (let x = 0; x < HEAD_COLUMNS; x++) {
    if (image.alpha(cell.left + x, cell.top + y) > 0) {
      columns.push(x);
    }
  }
  return columns;
}

// the top of his head on a frame of his flinch and its middle, in his own units from his feet
function headOf(frame) {
  const cell = cellOf('hurt', frame);
  let top = 0;
  while (drawnColumns(cell, top).length === 0) {
    top++;
  }
  const columns = [];
  for (let y = top; y < top + HEAD_ROWS; y++) {
    columns.push(...drawnColumns(cell, y));
  }
  const middle = columns.reduce((sum, x) => sum + x, 0) / columns.length;
  return { ahead: (middle - sprite.feetX) / UNIT, up: (sprite.feetY - top) / UNIT };
}

function brokenSun() {
  const game = createPlayingGame();
  game.missionIndex = 8;
  game.arena = { left: 0, right: 384 };
  game.player.x = 120;
  spawnEnemy(game, 'pharaoh', 1);
  const pharaoh = game.boss;
  Object.assign(pharaoh, { entering: false, x: game.player.x + 150, facing: -1 });
  pharaoh.ai.cooldown = 9999;
  startMove(game, pharaoh, 'sunBroken');
  return { game, pharaoh };
}

// each ring of stars as it appears, beside the frame he is drawn in on that tick
function starRings(game, pharaoh) {
  const rings = [];
  const seen = new Set();
  for (let tick = 0; tick < PHARAOH_MOVES.sunBroken.active; tick++) {
    runTicks(game, 1);
    pharaoh.ai.cooldown = 9999;
    const fresh = game.summons.filter((burst) => burst.sprite === 'stars' && !seen.has(burst));
    fresh.forEach((burst) => seen.add(burst));
    rings.push(...fresh.map((burst) => ({ burst, shown: enemySpriteFrame(pharaoh) })));
  }
  return rings;
}

describe('the Sand Pharaoh, reeling under the broken sun', () => {
  beforeEach(() => {
    Math.random = seededRandom(9);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('reels on two frames that hold his head still', () => {
    const [first, last] = PHARAOH_MOVES.sunBroken.loopFrames;
    const [one, other] = [headOf(first), headOf(last)];
    expect(Math.abs(one.ahead - other.ahead)).toBeLessThanOrEqual(2);
    expect(Math.abs(one.up - other.up)).toBeLessThanOrEqual(2);
  });

  it('rings his reeling head with the daze stars', () => {
    const { game, pharaoh } = brokenSun();
    const rings = starRings(game, pharaoh);
    expect(rings.length).toBeGreaterThan(3);
    for (const { burst, shown } of rings) {
      const head = headOf(shown[1]);
      const ahead = ((burst.x - pharaoh.x) * pharaoh.facing) / pharaoh.scale;
      const up = (pharaoh.y - burst.y) / pharaoh.scale;
      expect(shown[0]).toBe('hurt');
      expect(Math.abs(ahead - head.ahead), `ahead on hurt ${shown[1]}`).toBeLessThanOrEqual(3);
      expect(Math.abs(up - head.up), `up on hurt ${shown[1]}`).toBeLessThanOrEqual(7);
    }
  });
});
