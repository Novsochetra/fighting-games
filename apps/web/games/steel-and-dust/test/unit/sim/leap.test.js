import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { planLeap } from '../../../src/sim/brains/enemy/leap.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { createLootGame } from '../../support/loot-game.js';
import { buildTerrain, useTerrain } from '../../support/terrain-game.js';

// a breach in a level road from x 600 to 644
const ROAD = buildTerrain({ moats: [[600, 644]] });

function raider(fields) {
  return { x: 592, y: GROUND_Y, facing: 1, state: 'walk', walkDirection: 1, ...fields };
}

describe('a raider at the moat', () => {
  it('leaps it onto the far bank when the hero is over there', () => {
    expect(planLeap(ROAD, raider(), 700)).toBe(654);
    expect(planLeap(ROAD, raider({ x: 652, facing: -1 }), 500)).toBe(590);
  });

  it('stays on its side when the hero is on it too, or when it backs away', () => {
    expect(planLeap(ROAD, raider(), 596)).toBeNull();
    expect(planLeap(ROAD, raider({ walkDirection: -1 }), 700)).toBeNull();
    expect(planLeap(ROAD, raider({ state: 'attack' }), 700)).toBeNull();
  });

  it('only leaps from the edge, not from far back', () => {
    expect(planLeap(ROAD, raider({ x: 560 }), 700)).toBeNull();
  });
});

describe('a raider walking in', () => {
  function gameWithView(cameraX) {
    const { game } = createLootGame();
    useTerrain(game, ROAD);
    Object.assign(game, { arena: null, camera: { ...game.camera, x: cameraX } });

    return game;
  }

  it('comes in from the other side when its way in is over the moat', () => {
    const game = gameWithView(230);

    spawnEnemy(game, 'grunt', 1);

    expect(game.fighters.at(-1)).toMatchObject({ x: 212, facing: 1, entering: true });
  });

  it('comes in from its own side when the way is dry', () => {
    const game = gameWithView(100);

    spawnEnemy(game, 'grunt', 1);

    expect(game.fighters.at(-1)).toMatchObject({ x: 502, facing: -1 });
  });
});
