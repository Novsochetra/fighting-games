import { describe, expect, it } from 'vitest';
import { HERO_SPRITES } from '../../../src/data/hero-sprites.js';
import { THOUSAND_CUTS } from '../../../src/data/ultimates/thousand-cuts.js';
import { WEAPONS } from '../../../src/data/weapons/index.js';
import {
  passAt,
  passFrame,
  PASSES,
  PASSES_END,
  STILL_FRAME,
  SWORD_ROW,
} from '../../../src/sim/ultimates/cut-timing.js';

const { passesAt, passes, windTicks, crossTicks, releaseAt, leapAt } = THOUSAND_CUTS;

describe("Thousand Cuts' passes", () => {
  it('cuts one pass straight after another, then waits a beat before the cuts land', () => {
    expect(PASSES[0].start).toBe(passesAt);
    PASSES.slice(1).forEach((pass, i) => expect(pass.start).toBe(PASSES[i].end));
    expect(PASSES_END).toBe(PASSES.at(-1).end);
    expect(releaseAt - PASSES_END).toBeGreaterThanOrEqual(12);
    expect(leapAt).toBeGreaterThan(releaseAt);
  });

  it('winds up, crosses and lands its cut halfway across, then holds the follow-through', () => {
    for (const pass of PASSES) {
      expect(pass.crossAt).toBe(pass.start + windTicks);
      expect(pass.cutAt).toBe(pass.crossAt + crossTicks / 2);
      expect(pass.end).toBeGreaterThan(pass.crossAt + crossTicks);
    }
  });

  it('gets quicker as it goes, with the overhead cut that ends them held longest', () => {
    const ticks = passes.map((pass) => pass.ticks);
    const run = ticks.slice(0, -1);
    run.slice(1).forEach((tick, i) => expect(tick).toBeLessThanOrEqual(run[i]));
    expect(ticks.at(-1)).toBe(Math.max(...ticks));
  });

  it('cuts with his own sword strips, never two the same in a row, every frame on the strip', () => {
    passes.forEach(({ sprite: [strip, strike] }, i) => {
      expect(strike, strip).toBeGreaterThan(0);
      expect(strike + 1, strip).toBeLessThan(HERO_SPRITES.frames[strip]);
      if (i > 0) {
        expect(passes[i - 1].sprite[0]).not.toBe(strip);
      }
    });
  });

  it('draws him with the dav, the sword row, whatever he holds', () => {
    expect(SWORD_ROW).toBe(WEAPONS.sword.spriteRow);
    for (let time = passesAt; time < leapAt; time++) {
      expect(passFrame(time)[2], `tick ${time}`).toBe(SWORD_ROW);
    }
  });

  it('winds up on the frame before the strike, crosses on it, holds the one after', () => {
    const [first] = PASSES;
    const [strip, strike] = first.sprite;
    expect(passFrame(first.start)).toEqual([strip, strike - 1, SWORD_ROW]);
    expect(passFrame(first.crossAt)).toEqual([strip, strike, SWORD_ROW]);
    expect(passFrame(first.end - 1)).toEqual([strip, strike + 1, SWORD_ROW]);
    expect(passFrame(PASSES_END)).toEqual(STILL_FRAME);
  });

  it('knows which pass a tick belongs to', () => {
    expect(passAt(passesAt - 1)).toBe(-1);
    expect(passAt(passesAt)).toBe(0);
    expect(passAt(PASSES_END - 1)).toBe(PASSES.length - 1);
    expect(passAt(PASSES_END)).toBe(-1);
  });
});
