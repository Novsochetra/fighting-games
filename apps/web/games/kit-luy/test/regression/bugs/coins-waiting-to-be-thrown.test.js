import { describe, expect, it } from 'vitest';
import { createFx, stepFx, throwCoins } from '../../../src/fx/particles.js';
import { paintFx } from '../../../src/render/paint-fx.js';
import { fakeContext } from '../../support/fake-context.js';

// The coins of a burst leave one after another, the later ones waiting with an age under zero. The
// painter worked out a waiting coin's spin from that age, found no such frame of the spin and
// threw, which stopped the game dead on the fifth right answer in a row, the first burst with
// enough coins for one to still be waiting when the frame was drawn.
describe('a burst whose last coins have not been thrown yet', () => {
  it('paints the coins in the air and leaves the waiting ones out', () => {
    const fx = createFx();
    const context = fakeContext();

    throwCoins(fx, Math.random, { from: { x: 40, y: 200 }, to: { x: 60, y: 10 }, count: 12 });
    stepFx(fx, 1 / 60);

    expect(fx.particles.some((coin) => coin.age < 0)).toBe(true);
    expect(() => paintFx(context, fx)).not.toThrow();
    expect(context.rects.length).toBeGreaterThan(0);
  });

  it('paints nothing of a burst before its first coin is thrown', () => {
    const fx = createFx();
    const context = fakeContext();

    throwCoins(fx, Math.random, { from: { x: 40, y: 200 }, to: { x: 60, y: 10 }, count: 3 });
    fx.particles.forEach((coin) => {
      coin.age = -0.5;
    });
    paintFx(context, fx);

    expect(context.rects).toEqual([]);
  });
});
