import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { clearFadeOpacity } from '../../../src/render/overlays/clear-fade.js';
import { CLEAR_TICKS } from '../../../src/sim/stage/stage-clear.js';

const opacityAt = (clearTime, missionIndex = 0) => clearFadeOpacity({ clearTime, missionIndex });

describe('the fade after a cleared mission', () => {
  it('leaves the road lit while it is fought and through most of the clear', () => {
    expect(opacityAt(0)).toBe(0);
    expect(opacityAt(1)).toBe(0);
    expect(opacityAt(CLEAR_TICKS - 40)).toBe(0);
  });

  it('darkens tick by tick to full night as the next mission starts', () => {
    const ramp = [30, 20, 10, 0].map((left) => opacityAt(CLEAR_TICKS - left));
    expect(ramp).toEqual([0.25, 0.5, 0.75, 1]);
    expect(opacityAt(CLEAR_TICKS + 5)).toBe(1);
  });

  it('keeps the last mission lit behind the All clear screen', () => {
    expect(opacityAt(CLEAR_TICKS, MISSIONS.length - 1)).toBe(0);
    expect(opacityAt(CLEAR_TICKS, MISSIONS.length - 2)).toBe(1);
  });
});
