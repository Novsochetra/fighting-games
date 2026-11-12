import { describe, expect, it } from 'vitest';
import {
  burstSparks,
  createFx,
  dropNotes,
  scatterShards,
  stepFx,
  takeBanked,
  throwCoins,
} from '../../../src/fx/particles.js';

const FRAME = 1 / 60;
const halfway = () => 0.5;

function run(fx, seconds) {
  for (let elapsed = 0; elapsed < seconds; elapsed += FRAME) {
    stepFx(fx, FRAME);
  }
}

describe('the effects', () => {
  it('throws coins that all land in the pig, and counts each as banked', () => {
    const fx = createFx();
    const to = { x: 60, y: 8 };

    throwCoins(fx, Math.random, { from: { x: 20, y: 150 }, to, count: 8 });
    run(fx, 0.5);
    expect(fx.particles.length).toBeGreaterThan(0);

    run(fx, 1);
    expect(fx.particles).toEqual([]);
    expect(takeBanked(fx)).toBe(8);
    expect(takeBanked(fx)).toBe(0);
  });

  it('brings a coin to the pig itself before it goes', () => {
    const fx = createFx();
    const to = { x: 60, y: 8 };

    throwCoins(fx, halfway, { from: { x: 20, y: 150 }, to, count: 1 });

    const [coin] = fx.particles;

    run(fx, 2);
    expect(coin.x).toBeCloseTo(to.x, 5);
    expect(coin.y).toBeCloseTo(to.y, 5);
  });

  it('throws the coins of a burst one after another, the later ones waiting where they start', () => {
    const fx = createFx();

    throwCoins(fx, halfway, { from: { x: 20, y: 150 }, to: { x: 0, y: 0 }, count: 5 });
    stepFx(fx, FRAME);

    const waiting = fx.particles.filter((coin) => coin.age < 0);

    expect(waiting.length).toBeGreaterThan(0);
    expect(waiting.every((coin) => coin.x === 20 && coin.y === 150)).toBe(true);
  });

  it('lets shards and sparks fade out, banking nothing', () => {
    const fx = createFx();

    scatterShards(fx, Math.random, { x: 50, y: 50 });
    burstSparks(fx, Math.random, { at: { x: 50, y: 50 }, count: 12 });
    expect(fx.particles.length).toBe(22);

    run(fx, 1);
    expect(fx.particles).toEqual([]);
    expect(takeBanked(fx)).toBe(0);
  });

  it('drops notes from above the screen, across its width, falling', () => {
    const fx = createFx();

    dropNotes(fx, Math.random, { width: 120, count: 30 });

    expect(fx.particles.every((note) => note.y <= 0 && note.x >= 0 && note.x <= 120)).toBe(true);

    const before = fx.particles.map((note) => note.y);

    run(fx, 0.5);
    expect(fx.particles.every((note, i) => note.y > before[i])).toBe(true);

    run(fx, 6);
    expect(fx.particles).toEqual([]);
  });
});
