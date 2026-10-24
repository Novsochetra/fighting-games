import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { LOOT_BLINK, LOOT_LIFETIME, LOOT_MOTION } from '../../../src/data/loot.js';
import { isBlinking, updateLoot } from '../../../src/sim/items/loot.js';
import { countRandomDraws, createLootGame, piece, soundKeys } from '../../support/loot-game.js';

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

describe('the hero gathering loot', () => {
  it('pulls in a piece close by once it has been out a moment, and takes it', () => {
    const { game, sounds } = lootGame([{ x: 120, time: LOOT_MOTION.pullDelay }]);
    updateLoot(game);
    expect(game.loot[0].pulled).toBe(true);
    run(game, 20);
    expect(game.loot).toEqual([]);
    expect(game.coins).toBe(1);
    expect(soundKeys(sounds)).toContain('coin');
  });

  it('lets a fresh spill fly before pulling any of it in', () => {
    const { game } = lootGame([{ x: 105, time: 0 }]);
    run(game, LOOT_MOTION.pullDelay - 1);
    expect(game.loot[0].pulled).toBe(false);
  });

  it('leaves pieces out of reach, and pieces on a deck far above', () => {
    const { game } = lootGame([
      { x: 100 + LOOT_MOTION.magnetReach + 5, time: 60 },
      { x: 100, y: GROUND_Y - LOOT_MOTION.magnetHeight - 5, time: 60 },
    ]);
    run(game, 10);
    expect(game.loot.every((each) => !each.pulled)).toBe(true);
  });

  it('a knocked-out hero lets go, and the piece drops where it was', () => {
    const { game } = lootGame([{ x: 125, time: 60 }]);
    updateLoot(game);
    game.player.state = 'ko';
    updateLoot(game);
    expect(game.loot[0]).toMatchObject({ pulled: false, landed: false });
    expect(game.coins).toBe(0);
  });

  it('at a stage clear pulls in every piece on the road, however far', () => {
    const { game } = lootGame([
      { x: 360, time: 0 },
      { kind: 'gem', x: 10, time: 0 },
    ]);
    game.clearTime = 1;
    run(game, LOOT_MOTION.clearPullDelay + 90);
    expect(game.loot).toEqual([]);
    expect(game.coins).toBe(11);
  });
});

describe('loot left lying', () => {
  it('blinks for its last two seconds, then is gone', () => {
    const { game } = lootGame([{ x: 300, time: LOOT_LIFETIME - LOOT_BLINK - 1 }]);
    expect(isBlinking(game, game.loot[0])).toBe(false);
    updateLoot(game);
    expect(isBlinking(game, game.loot[0])).toBe(true);
    run(game, LOOT_BLINK);
    expect(game.loot).toEqual([]);
    expect(game.coins).toBe(0);
  });

  it('never blinks out over a stage clear', () => {
    const { game } = lootGame([{ x: 300, time: LOOT_LIFETIME + 5 }]);
    game.clearTime = 1;
    expect(isBlinking(game, game.loot[0])).toBe(false);
    updateLoot(game);
    expect(game.loot.length + game.coins).toBeGreaterThan(0);
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

  it('moves, pulls and takes loot without a draw from Math.random', () => {
    const { game } = lootGame([
      { x: 110, time: 60 },
      { x: 300, time: 0, landed: false, vy: -3, vx: 1 },
      { kind: 'gem', x: 95, time: 60 },
      { kind: 'apple', x: 90, time: 60 },
    ]);
    expect(countRandomDraws(() => run(game, 120))).toBe(0);
  });
});
