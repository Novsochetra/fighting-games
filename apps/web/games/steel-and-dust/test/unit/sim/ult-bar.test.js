import { describe, expect, it } from 'vitest';
import { ULT_FULL, ULT_MAX } from '../../../src/config.js';
import {
  addUltMeter,
  canAffordHeavy,
  heavyCost,
  meterForHit,
  spendHeavy,
  spendUlt,
  ultReady,
} from '../../../src/sim/combat/ult-bar.js';

const player = { side: 'player' };
const raider = { side: 'enemy' };
const standIn = { side: 'player' };

function gameWith(ultMeter, difficulty = 1) {
  return { ultMeter, player, settings: { difficulty } };
}

describe('the ULT bar', () => {
  it('holds two ultimates', () => {
    const game = gameWith(ULT_MAX - 5);
    addUltMeter(game, 40);
    expect(game.ultMeter).toBe(ULT_MAX);
  });

  it('is filled by the hero landing light blows, not heavies or ultimates', () => {
    const game = gameWith(0);
    const light = { attacker: player, target: raider, move: { id: 'L1' } };
    expect(meterForHit(game, light, 10)).toBe(8);
    for (const id of ['K1', 'K2', 'K3', 'LLK', 'UK', 'C1', 'C2', 'AK', 'ADK']) {
      expect(meterForHit(game, { ...light, move: { id } }, 10)).toBe(0);
    }
    expect(meterForHit(game, { ...light, move: { id: 'L1', ultimate: true } }, 10)).toBe(0);
  });

  it("charges a technique, as it comes off the light button, but not a summon's strike", () => {
    const game = gameWith(0);
    expect(meterForHit(game, { attacker: player, target: raider, move: { id: 'S2' } }, 10)).toBe(8);
    const summon = { attacker: standIn, target: raider, move: { damage: 6 } };
    expect(meterForHit(game, summon, 6)).toBe(0);
  });

  it('is filled by the blows the hero takes', () => {
    const game = gameWith(0);
    expect(meterForHit(game, { attacker: raider, target: player, move: { id: 'jab' } }, 12)).toBe(
      12,
    );
  });

  it('pays for a heavy at the price of the difficulty', () => {
    expect([0, 1, 2].map((difficulty) => heavyCost(gameWith(0, difficulty)))).toEqual([7, 10, 13]);
    const game = gameWith(15);
    expect(canAffordHeavy(game)).toBe(true);
    spendHeavy(game);
    expect(game.ultMeter).toBe(5);
    expect(canAffordHeavy(game)).toBe(false);
  });

  it('spends one ultimate and keeps the second', () => {
    const game = gameWith(ULT_MAX);
    expect(ultReady(game)).toBe(true);
    spendUlt(game);
    expect(game.ultMeter).toBe(ULT_FULL);
    expect(ultReady(game)).toBe(true);
    spendUlt(game);
    expect(ultReady(game)).toBe(false);
  });
});
