import { describe, expect, it } from 'vitest';
import { GROUND_Y, VIEW_WIDTH } from '../../../src/config.js';
import { TEMPLE_BOULDER } from '../../../src/data/temple-boulders.js';
import { dash } from '../../../src/sim/fighters/actions.js';
import { rollFrame, rollOn } from '../../../src/sim/hazards/boulder-roll.js';
import {
  createTempleBoulders,
  updateTempleBoulders,
} from '../../../src/sim/hazards/temple-boulders.js';
import { createLootGame, soundKeys, spawnEnemy } from '../../support/loot-game.js';
import { buildTerrain } from '../../support/terrain-game.js';

const SPOT = 100;
const ENTERS_AT = VIEW_WIDTH + TEMPLE_BOULDER.margin;
const QUARTER_TURN = (Math.PI * TEMPLE_BOULDER.diameter) / 4;

// the hero just short of the boulder's spot, the camera still
function templeGame() {
  const { game, sounds } = createLootGame();
  game.camera.x = 0;
  game.player.x = SPOT - 10;
  game.boulders = createTempleBoulders([{ x: SPOT, y: game.player.y }]);

  return { game, sounds, boulder: game.boulders[0] };
}

function run(game, ticks) {
  for (let i = 0; i < ticks; i++) {
    updateTempleBoulders(game);
  }
}

// the hero past its spot and the warning over, so it is rolling in from the right edge
function rollingGame() {
  const temple = templeGame();
  temple.game.player.x = SPOT + 10;
  run(temple.game, TEMPLE_BOULDER.warn + 1);

  return temple;
}

// ticks until it reaches `x`, rolling in from the right edge
const ticksTo = (x) => Math.ceil((ENTERS_AT - x) / TEMPLE_BOULDER.speed);

describe('a temple boulder', () => {
  it('waits for the hero to pass its spot, shakes the road a second, then rolls in from the right', () => {
    const { game, sounds, boulder } = templeGame();

    run(game, 30);
    expect(boulder.state).toBe('waiting');
    game.player.x = SPOT + 10;
    run(game, 1);
    expect(boulder.state).toBe('loose');
    expect(game.camera.shakeTime).toBeGreaterThan(0);
    run(game, TEMPLE_BOULDER.warn);

    expect(boulder).toMatchObject({ state: 'rolling', x: ENTERS_AT });
    expect(soundKeys(sounds)).toEqual(['faceRise', 'boulderRoll']);
  });

  it('rolls across the screen and off its far edge, once a run', () => {
    const { game, boulder } = rollingGame();

    run(game, ticksTo(-TEMPLE_BOULDER.margin) + 1);
    expect(boulder.state).toBe('gone');
    game.player.x = SPOT + 40;
    run(game, TEMPLE_BOULDER.warn + 2);

    expect(boulder.state).toBe('gone');
  });

  it('stays put once the hero is a screen past it, so two never roll at once', () => {
    const { game, boulder } = templeGame();
    game.player.x = SPOT + VIEW_WIDTH + 10;

    run(game, TEMPLE_BOULDER.warn + 2);

    expect(boulder.state).toBe('waiting');
  });

  it('breaks loose with a boss on the road too', () => {
    const { game, boulder } = templeGame();
    spawnEnemy(game, 'pharaoh', SPOT + 200);
    game.player.x = SPOT + 10;

    run(game, 1);

    expect(boulder.state).toBe('loose');
  });

  it('flattens each raider in its way once, and passes under one in the air', () => {
    const { game } = rollingGame();
    const footSoldier = spawnEnemy(game, 'grunt', 260);
    const heavy = spawnEnemy(game, 'juggernaut', 200);
    const flying = spawnEnemy(game, 'grunt', 230);
    Object.assign(flying, { y: GROUND_Y - 50, airborne: true, state: 'air', vy: 0 });

    run(game, ticksTo(150));

    expect(footSoldier.state).toBe('ko');
    expect(heavy.hp).toBe(heavy.def.hp - 50);
    expect(flying.hp).toBe(flying.def.hp);
  });

  it('hurts the hero who stays on the road, but not one who jumps it or dashes through it', () => {
    const standing = rollingGame();
    standing.game.player.x = 200;
    run(standing.game, ticksTo(170));
    expect(standing.game.player.hp).toBeLessThan(standing.game.player.maxHp);
    expect(standing.game.player.hp).toBeGreaterThan(0);

    const jumping = rollingGame();
    Object.assign(jumping.game.player, { x: 200, y: GROUND_Y - 40, airborne: true });
    run(jumping.game, ticksTo(170));
    expect(jumping.game.player.hp).toBe(jumping.game.player.maxHp);

    const dashing = rollingGame();
    dashing.game.player.x = 200;
    run(dashing.game, ticksTo(200 + 30));
    dash(dashing.game, dashing.game.player, 1);
    run(dashing.game, 8);
    expect(dashing.game.player.hp).toBe(dashing.game.player.maxHp);
  });
});

describe('the roll of a temple boulder', () => {
  const rollFrom = (terrain, x) => ({ x, y: terrain.heights[x], vy: 0, rolled: 0 });

  it('turns a quarter with every quarter of its rim it rolls', () => {
    expect([0, QUARTER_TURN, QUARTER_TURN * 2, QUARTER_TURN * 3 + 1].map(rollFrame)).toEqual([
      0, 1, 2, 3,
    ]);
    expect(rollFrame(QUARTER_TURN * 4)).toBe(0);
  });

  it('climbs a temple step and follows a slope back down', () => {
    const terrain = buildTerrain({
      ground: [
        [100, 0],
        [100, 8],
        [160, 8],
        [220, 0],
      ],
    });
    const boulder = rollFrom(terrain, 300);
    const heights = new Set();

    while (boulder.x > 50) {
      expect(rollOn(terrain, boulder)).toBe(true);
      heights.add(boulder.y);
    }

    expect(Math.min(...heights)).toBe(GROUND_Y - 8);
    expect(boulder.y).toBe(GROUND_Y);
  });

  it('falls off a ledge, and stops at a rise too tall to climb', () => {
    const terrain = buildTerrain({
      ground: [
        [100, 0],
        [100, 30],
        [200, 30],
        [200, 0],
      ],
    });
    const fromLedge = rollFrom(terrain, 150);
    while (fromLedge.x > 60) {
      rollOn(terrain, fromLedge);
    }
    expect(fromLedge.y).toBe(GROUND_Y);

    const atWall = rollFrom(terrain, 260);
    let rolling = true;
    while (rolling) {
      rolling = rollOn(terrain, atWall);
    }
    expect(atWall.x).toBeGreaterThanOrEqual(200);
    expect(atWall.y).toBe(GROUND_Y);
  });
});
