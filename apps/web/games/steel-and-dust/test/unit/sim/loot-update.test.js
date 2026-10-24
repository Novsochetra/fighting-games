import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { LOOT_BLINK, LOOT_LIFETIME, LOOT_MOTION } from '../../../src/data/loot.js';
import { isBlinking, isExpired, updateLoot } from '../../../src/sim/items/loot.js';
import { countRandomDraws, createLootGame, piece, soundKeys } from '../../support/loot-game.js';

const READY = LOOT_MOTION.pickupDelay;

function lootGame(pieces) {
  const { game, sounds } = createLootGame();
  game.player.x = 100;
  game.player.y = GROUND_Y;
  game.loot = pieces.map((each) => piece({ y: GROUND_Y, landed: true, ...each }));
  return { game, sounds };
}

function run(game, ticks) {
  for (let tick = 0; tick < ticks; tick++) {
    updateLoot(game);
  }
}

function inTheAir(game, y) {
  Object.assign(game.player, { state: 'air', airborne: true, y });
}

describe('the hero taking loot', () => {
  it('takes a piece the hero walks onto, and counts it for the summary', () => {
    const { game, sounds } = lootGame([{ x: 104, time: READY }]);
    updateLoot(game);
    expect(game.loot).toEqual([]);
    expect(game.coins).toBe(1);
    expect(game.missionLoot).toEqual({ coin: 1, gem: 0, apple: 0 });
    expect(soundKeys(sounds)).toContain('coin');
  });

  it('leaves a piece a step away lying where it is, however long the hero waits', () => {
    const { game } = lootGame([{ x: 125, time: READY }]);
    run(game, 120);
    expect(game.loot).toHaveLength(1);
    expect(game.loot[0]).toMatchObject({ x: 125, y: GROUND_Y });
    expect(game.coins).toBe(0);
  });

  it('leaves a piece the hero jumps clear over', () => {
    const { game } = lootGame([{ x: 100, time: READY }]);
    inTheAir(game, GROUND_Y - 30);
    run(game, 5);
    expect(game.loot).toHaveLength(1);
  });

  it('takes a piece the hero lands on', () => {
    const { game } = lootGame([{ x: 100, time: READY }]);
    inTheAir(game, GROUND_Y - 4);
    updateLoot(game);
    expect(game.loot).toEqual([]);
  });

  it('leaves a piece on a deck far above the hero', () => {
    const { game } = lootGame([{ x: 100, y: GROUND_Y - 50, time: READY }]);
    run(game, 5);
    expect(game.loot).toHaveLength(1);
  });

  it('lets a fresh spill be seen to fly before any of it can be taken', () => {
    const { game } = lootGame([{ x: 100, time: 0 }]);
    run(game, READY - 1);
    expect(game.loot).toHaveLength(1);
    updateLoot(game);
    expect(game.loot).toEqual([]);
  });

  it('a knocked-out hero takes nothing', () => {
    const { game } = lootGame([{ x: 100, time: READY }]);
    game.player.state = 'ko';
    run(game, 5);
    expect(game.loot).toHaveLength(1);
    expect(game.coins).toBe(0);
  });
});

describe('loot left lying', () => {
  it('blinks for its last two seconds, then is gone, five seconds after it came out', () => {
    expect(LOOT_LIFETIME).toBe(5 * 60);
    const { game } = lootGame([{ x: 300, time: LOOT_LIFETIME - LOOT_BLINK - 1 }]);
    expect(isBlinking(game.loot[0])).toBe(false);
    updateLoot(game);
    expect(isBlinking(game.loot[0])).toBe(true);
    run(game, LOOT_BLINK);
    expect(game.loot).toEqual([]);
    expect(game.coins).toBe(0);
  });

  it("keeps its own five seconds in the loot time after the boss's fall", () => {
    const { game } = lootGame([{ x: 300, time: LOOT_LIFETIME - 1 }]);
    game.lootTime = 1;
    expect(isExpired(game.loot[0])).toBe(false);
    updateLoot(game);
    expect(game.loot).toEqual([]);
  });
});

describe('the purse and the coin run count down', () => {
  it('lets the purse bump and the coin run run out', () => {
    const { game } = lootGame([]);
    game.purseBump = 2;
    game.coinStreak = { count: 4, timer: 1 };
    run(game, 3);
    expect(game.purseBump).toBe(0);
    expect(game.coinStreak.timer).toBe(0);
  });

  it('moves and takes loot without a draw from Math.random', () => {
    const { game } = lootGame([
      { x: 102, time: 60 },
      { x: 300, time: 0, landed: false, vy: -3, vx: 1 },
      { kind: 'gem', x: 95, time: 60 },
      { kind: 'apple', x: 98, time: 60 },
    ]);
    expect(countRandomDraws(() => run(game, 120))).toBe(0);
    expect(game.missionLoot).toEqual({ coin: 1, gem: 1, apple: 1 });
  });
});
