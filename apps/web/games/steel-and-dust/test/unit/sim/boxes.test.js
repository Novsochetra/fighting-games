import { describe, expect, it } from 'vitest';
import {
  attackBox,
  hurtBox,
  overlapCenter,
  overlaps,
  swingBox,
} from '../../../src/sim/combat/boxes.js';

const fighter = (extra) => ({
  x: 100,
  y: 184,
  facing: 1,
  scale: 1,
  state: 'idle',
  removed: false,
  ...extra,
});

describe('hit boxes', () => {
  it('mirrors an attack box when facing left', () => {
    expect(attackBox(fighter(), [4, -28, 14, 7])).toEqual({ x: 104, y: 156, width: 14, height: 7 });
    expect(attackBox(fighter({ facing: -1 }), [4, -28, 14, 7])).toEqual({
      x: 82,
      y: 156,
      width: 14,
      height: 7,
    });
  });

  it('scales with the fighter', () => {
    expect(attackBox(fighter({ scale: 2 }), [4, -28, 14, 7]).width).toBe(28);
  });

  it('shapes the hurt box by state and drops it on a knock-out', () => {
    expect(hurtBox(fighter())).toEqual({ x: 94, y: 152, width: 12, height: 32 });
    expect(hurtBox(fighter({ state: 'down' })).height).toBe(8);
    expect(hurtBox(fighter({ state: 'dash' })).height).toBe(16);
    expect(hurtBox(fighter({ state: 'ko' }))).toBeNull();
    expect(hurtBox(fighter({ removed: true }))).toBeNull();
  });

  it('mirrors a body drawn off its feet when it turns round', () => {
    const queen = { hurtShape: [10, 40, 27, 40] };
    expect(hurtBox(fighter({ def: queen }))).toMatchObject({ x: 90, width: 27 });
    expect(hurtBox(fighter({ def: queen, facing: -1 }))).toMatchObject({ x: 83, width: 27 });
  });

  it("reaches a shared swing as far as the boss's own art draws it", () => {
    const swipe = { id: 'swipe', hitbox: [2, -38, 30, 26] };
    const reach = { swipe: [2, -29, 42, 29] };
    expect(swingBox(fighter({ move: swipe })).width).toBe(30);
    expect(swingBox(fighter({ move: swipe, def: { reach }, scale: 2 }))).toEqual({
      x: 104,
      y: 126,
      width: 84,
      height: 58,
    });
  });

  it('finds overlaps and their middle', () => {
    const first = { x: 0, y: 0, width: 10, height: 10 };
    const second = { x: 6, y: 4, width: 10, height: 10 };
    expect(overlaps(first, second)).toBe(true);
    expect(overlaps(first, { x: 10, y: 0, width: 5, height: 5 })).toBe(false);
    expect(overlapCenter(first, second)).toEqual({ x: 8, y: 7 });
  });
});
