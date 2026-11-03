import { describe, expect, it } from 'vitest';
import { SPIRIT } from '../../../src/data/tuning.js';
import {
  concedeSpirit,
  fillSpirit,
  gainSpirit,
  hasSpirit,
  refillSpirit,
  spendSpirit,
  spiritMaxOf,
} from '../../../src/sim/spirit.js';
import { matchInPlay } from '../../support/match-driver.js';

const gauge = (spirit, spiritMax = 100) => ({ spirit, spiritMax });

describe('the spirit gauge', () => {
  it('holds what the spec gives, or grows with stamina', () => {
    expect(spiritMaxOf({ spiritMax: 120 })).toBe(120);
    expect(spiritMaxOf({ stats: { stamina: 95 } })).toBeGreaterThan(
      spiritMaxOf({ stats: { stamina: 10 } }),
    );
  });

  it('refills slowly up to its top', () => {
    const player = gauge(50);

    refillSpirit(player);
    expect(player.spirit).toBeCloseTo(50 + SPIRIT.refill);

    player.spirit = 99.999;
    refillSpirit(player);
    expect(player.spirit).toBe(100);
  });

  it('fills at once for a boost', () => {
    const player = gauge(3, 80);

    fillSpirit(player);

    expect(player.spirit).toBe(80);
  });

  it('pays for a move only with enough in it', () => {
    const player = gauge(30);

    expect(hasSpirit(player, 40)).toBe(false);
    expect(spendSpirit(player, 40)).toBe(false);
    expect(player.spirit).toBe(30);
    expect(spendSpirit(player, 20)).toBe(true);
    expect(player.spirit).toBe(10);
  });
});

describe('the spirit good play fills', () => {
  it('fills the one who played it, and his side’s stars by their share', () => {
    const match = matchInPlay();
    const [mid, star, other] = [match.players[6], match.players[9], match.players[15]];

    Object.assign(star, { star: 'sochetra', spirit: 0, spiritMax: 100 });
    Object.assign(mid, { spirit: 0 });
    Object.assign(other, { star: 'haruto', spirit: 0 });
    gainSpirit(match, mid, 'tackle');

    expect(mid.spirit).toBe(SPIRIT.gain.tackle);
    expect(star.spirit).toBeCloseTo(SPIRIT.gain.tackle * SPIRIT.starShare);
    expect(other.spirit).toBe(0);
  });

  it('takes points as well as a gain’s name, and nothing from none', () => {
    const match = matchInPlay();
    const mid = Object.assign(match.players[6], { spirit: 10 });

    gainSpirit(match, mid, 3);
    gainSpirit(match, mid, 'nothing');
    gainSpirit(match, null, 'pass');

    expect(mid.spirit).toBe(13);
  });

  it('stirs the stars of a side that let a goal in', () => {
    const match = matchInPlay();
    const star = Object.assign(match.players[9], { star: 'sochetra', spirit: 0 });
    const plain = Object.assign(match.players[8], { spirit: 0 });

    concedeSpirit(match, 0);

    expect(star.spirit).toBe(SPIRIT.conceded);
    expect(plain.spirit).toBe(0);
  });
});
