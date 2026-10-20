import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../../src/config.js';
import { FLASH, strikeAt } from '../../../../src/render/scene/ambient/lightning.js';
import { ALL_COLORS, rectsOf, recordEffect, ticksUpTo } from './ambient-recorder.js';

const storm = {
  kind: 'lightning',
  plane: 'back',
  period: 540,
  top: 10,
  bottom: 150,
  strength: 0.1,
};

function litTicks(effect, lastTick) {
  return ticksUpTo(lastTick, 1).filter((tick) => strikeAt(effect, tick) > 0);
}

describe('ambient lightning', () => {
  it('strikes once in every period, for as many ticks as its flash lasts', () => {
    const lit = litTicks(storm, storm.period * 4 - 1);
    expect(lit).toHaveLength(FLASH.length * 4);
    for (let period = 0; period < 4; period++) {
      const inPeriod = lit.filter((tick) => Math.floor(tick / storm.period) === period);
      expect(inPeriod).toHaveLength(FLASH.length);
      expect(inPeriod.at(-1) - inPeriod[0]).toBe(FLASH.length - 1);
    }
  });

  it('strikes at a different moment in each period', () => {
    const starts = new Set();
    for (let period = 0; period < 6; period++) {
      const first = litTicks(storm, storm.period * 6).find(
        (tick) => Math.floor(tick / storm.period) === period,
      );
      starts.add(first - period * storm.period);
    }
    expect(starts.size).toBeGreaterThan(4);
  });

  it('draws nothing between strikes', () => {
    const dark = ticksUpTo(storm.period, 1).filter((tick) => strikeAt(storm, tick) === 0);
    for (const tick of dark.slice(0, 40)) {
      expect(recordEffect(storm, { tick }).log).toEqual([]);
    }
  });

  it('lights the whole width of the sky, most at the top, flickering with the flash', () => {
    const [first] = litTicks(storm, storm.period);
    const alphas = [];
    for (let age = 0; age < FLASH.length; age++) {
      const rects = rectsOf(storm, { tick: first + age, cameraX: 300 });
      expect(rects.every((rect) => rect.x === 0 && rect.width === VIEW_WIDTH)).toBe(true);
      expect(rects.every((rect) => rect.y === storm.top)).toBe(true);
      expect(rects[0].height).toBe(storm.bottom - storm.top);
      expect(rects.at(-1).height).toBeLessThan(rects[0].height);
      expect(rects.every((rect) => rect.color === ALL_COLORS.lightning)).toBe(true);
      alphas.push(rects[0].alpha);
    }
    expect(alphas).toEqual(FLASH.map((brightness) => storm.strength * brightness));
  });
});
