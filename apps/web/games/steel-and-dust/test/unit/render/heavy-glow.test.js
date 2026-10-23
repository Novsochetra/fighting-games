import { describe, expect, it } from 'vitest';
import { HEAVY_ART } from '../../../src/art/heavy-fx/index.js';
import { HEAVY_FEEL } from '../../../src/data/heavy-feel/index.js';
import { heavyGlowColor, heavyLeanX } from '../../../src/render/fighters/heavy-glow.js';

function heroIn(id, moveTime, startup = 12) {
  return { state: 'attack', move: { id, startup }, moveTime };
}

describe('the glow a heavy winds up in', () => {
  const art = HEAVY_ART.ember;

  it('starts dim, gathers full, flares hot as it strikes and fades just after', () => {
    const glow = (time) => heavyGlowColor(heroIn('K1', time), 'ember');
    expect(glow(0)).toBe(art.glowDim);
    expect(glow(5)).toBe(art.glowDim);
    expect(glow(6)).toBe(art.glow);
    expect(glow(9)).toBe(art.glow);
    expect(glow(10)).toBe(art.hot);
    expect(glow(13)).toBe(art.hot);
    expect(glow(14)).toBeNull();
  });

  it('draws the hero back over the wind-up and forward again as it strikes', () => {
    const { lean, leanTicks } = HEAVY_FEEL.ember;
    const facingRight = (time) => heavyLeanX({ ...heroIn('K1', time), facing: 1 }, 'ember');
    expect(facingRight(0)).toBeLessThanOrEqual(0);
    expect(facingRight(leanTicks - 1)).toBe(-lean);
    expect(facingRight(11)).toBe(-lean);
    expect(facingRight(12)).toBe(0);
    expect(heavyLeanX({ ...heroIn('K1', 11), facing: -1 }, 'ember')).toBe(lean);
  });

  it('leaves light moves, other states and an unknown sheet alone', () => {
    expect(heavyGlowColor(heroIn('L1', 0), 'ember')).toBeNull();
    expect(heavyGlowColor({ ...heroIn('K1', 0), state: 'idle' }, 'ember')).toBeNull();
    expect(heavyGlowColor(heroIn('K1', 0), undefined)).toBeNull();
  });
});
