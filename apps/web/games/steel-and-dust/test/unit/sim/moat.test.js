import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { MOAT } from '../../../src/data/moat.js';
import { blockWall, nudge } from '../../../src/sim/fighters/terrain-motion.js';
import { updateMoat } from '../../../src/sim/hazards/moat.js';
import { createLootGame, piece, soundKeys, spawnEnemy } from '../../support/loot-game.js';
import { buildTerrain, useTerrain } from '../../support/terrain-game.js';

// a breach in a level road from x 200 to 244
const [FROM, TO] = [200, 244];
const ROAD = buildTerrain({ moats: [[FROM, TO]] });
const [{ level: WATER }] = ROAD.water;

function moatGame() {
  const { game, sounds } = createLootGame();
  game.player.x = 120;
  useTerrain(game, ROAD);

  return { game, sounds };
}

// a body knocked over the water, its feet just reaching it
function fallingIn(fighter, x) {
  return Object.assign(fighter, { x, y: WATER, airborne: true, state: 'juggle', vx: 2 });
}

describe('the edge of a moat', () => {
  it('stops feet on the road, and lets a body in the air go over it', () => {
    const walker = { x: FROM + 1, y: GROUND_Y, airborne: false };
    const jumper = { x: FROM + 1, y: GROUND_Y - 20, airborne: true };

    expect(blockWall(ROAD, walker, { x: FROM - 1, y: GROUND_Y })).toBe(1);
    expect(walker.x).toBe(FROM - 1);
    expect(blockWall(ROAD, jumper, { x: FROM - 1, y: GROUND_Y - 20 })).toBe(0);
    expect(jumper.x).toBe(FROM + 1);
  });

  it('stops a push at the edge', () => {
    const pushed = { x: TO + 1, y: GROUND_Y, airborne: false, state: 'hurt' };

    nudge(ROAD, pushed, -2);

    expect(pushed.x).toBe(TO + 1);
  });
});

describe('a raider that falls in the moat', () => {
  it('is out at once, with a splash and a bonus, however much health it has', () => {
    const { game, sounds } = moatGame();
    const raider = fallingIn(spawnEnemy(game, 'juggernaut', FROM + 10), FROM + 10);
    const score = game.score;

    updateMoat(game);

    expect(raider).toMatchObject({ removed: true, state: 'ko' });
    expect(game.score).toBeGreaterThan(score + MOAT.ringOutBonus);
    expect(soundKeys(sounds)).toEqual(expect.arrayContaining(['splash', 'ko']));
    expect(game.floaters.map((floater) => floater.text)).toContain('Ring out!');
  });

  it('leaves its purse on the nearer bank, rolling away from the water', () => {
    const { game } = moatGame();
    fallingIn(spawnEnemy(game, 'grunt', TO - 8), TO - 8);

    updateMoat(game);

    expect(game.loot.length).toBeGreaterThan(0);
    for (const coin of game.loot) {
      expect(coin).toMatchObject({ x: TO + MOAT.bankIn, y: GROUND_Y - 1 });
      expect(coin.vx).toBeGreaterThanOrEqual(0);
    }
  });

  it('just sinks when it was knocked out already, scoring nothing more', () => {
    const { game } = moatGame();
    const raider = fallingIn(spawnEnemy(game, 'grunt', FROM + 20), FROM + 20);
    raider.state = 'ko';
    const score = game.score;

    updateMoat(game);

    expect(raider.removed).toBe(true);
    expect(game.score).toBe(score);
  });
});

describe('the hero or a boss in the moat', () => {
  it('hauls the hero out on the nearer bank, hurt but never knocked out by it', () => {
    const { game } = moatGame();
    const hero = fallingIn(game.player, TO - 6);
    hero.hp = 5;

    updateMoat(game);

    expect(hero).toMatchObject({
      x: TO + MOAT.bankIn,
      y: GROUND_Y,
      airborne: false,
      state: 'idle',
    });
    expect(hero.hp).toBe(1);
    expect(hero.invincible).toBe(MOAT.heroInvincible);
  });

  it('hauls a boss out unharmed rather than ringing it out', () => {
    const { game } = moatGame();
    const boss = fallingIn(spawnEnemy(game, 'naga', FROM + 6), FROM + 6);
    const hp = boss.hp;

    updateMoat(game);

    expect(boss.removed).toBeFalsy();
    expect(boss).toMatchObject({ x: FROM - MOAT.bankIn, hp, airborne: false });
  });
});

describe('loot over the moat', () => {
  it('sinks once it comes down to the water, and the rest stays', () => {
    const { game } = moatGame();
    const sinking = piece({ x: FROM + 20, y: WATER + 1, vy: 2 });
    const ashore = piece({ x: FROM - 20, y: GROUND_Y });
    game.loot = [sinking, ashore];

    updateMoat(game);

    expect(game.loot).toEqual([ashore]);
  });
});
