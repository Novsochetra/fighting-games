import { describe, expect, it } from 'vitest';
import { APPLE_HEAL, COIN_STREAK, LOOT_VALUES } from '../../../src/data/loot.js';
import { collectPiece, streakRate } from '../../../src/sim/items/loot-collect.js';
import { createLootGame, piece, soundKeys } from '../../support/loot-game.js';

describe('taking loot', () => {
  it('a coin puts one in the purse and ten on the score, with a coin sound', () => {
    const { game, sounds } = createLootGame();
    const coin = piece({ kind: 'coin' });
    collectPiece(game, coin);
    expect(coin.taken).toBe(true);
    expect(game.coins).toBe(LOOT_VALUES.coin.coins);
    expect(game.score).toBe(LOOT_VALUES.coin.score);
    expect(soundKeys(sounds)).toEqual(['coin']);
    expect(game.purseBump).toBeGreaterThan(0);
    expect(game.lootFx).toHaveLength(1);
  });

  it('a gem is worth ten coins and shows what it added to the score', () => {
    const { game, sounds } = createLootGame();
    collectPiece(game, piece({ kind: 'gem' }));
    expect(game.coins).toBe(10);
    expect(game.score).toBe(100);
    expect(soundKeys(sounds)).toEqual(['gem']);
    expect(game.floaters.map((floater) => floater.text)).toEqual(['+100']);
  });

  it('an apple heals a bite, never past full, and leaves the purse alone', () => {
    const { game, sounds } = createLootGame();
    game.player.hp = 50;
    collectPiece(game, piece({ kind: 'apple' }));
    expect(game.player.hp).toBe(50 + APPLE_HEAL);
    expect(game.coins).toBe(0);
    expect(game.purseBump).toBe(0);
    expect(soundKeys(sounds)).toEqual(['appleBite', 'heal']);
    game.player.hp = game.player.maxHp - 1;
    collectPiece(game, piece({ kind: 'apple' }));
    expect(game.player.hp).toBe(game.player.maxHp);
  });
});

describe('a run of coins', () => {
  it('climbs the scale coin by coin, then holds at its top', () => {
    const rates = COIN_STREAK.scale.map((_, step) => streakRate(step));
    for (let i = 1; i < rates.length; i++) {
      expect(rates[i]).toBeGreaterThan(rates[i - 1]);
    }
    expect(streakRate(0)).toBe(1);
    expect(streakRate(99)).toBe(rates.at(-1));
  });

  it('rings each quick coin higher, and starts again low after a pause', () => {
    const { game, sounds } = createLootGame();
    for (let i = 0; i < 3; i++) {
      collectPiece(game, piece());
    }
    game.coinStreak.timer = 0;
    collectPiece(game, piece());
    const rates = sounds.map((sound) => sound.rate);
    expect(rates).toEqual([streakRate(0), streakRate(1), streakRate(2), streakRate(0)]);
  });
});
