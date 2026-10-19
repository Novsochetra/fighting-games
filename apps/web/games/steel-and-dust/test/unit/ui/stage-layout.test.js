import { describe, expect, it } from 'vitest';
import { isPortrait, stageRect, stickRestPosition } from '../../../src/ui/screen/stage-layout.js';

const noInsets = { top: 0, right: 0, bottom: 0, left: 0 };

describe('stage layout', () => {
  it('letterboxes the 16:9 screen in landscape', () => {
    expect(
      stageRect({ width: 1000, height: 400, safe: noInsets, portrait: false, buttonScale: 1 }),
    ).toEqual({
      x: 144,
      y: 0,
      width: 711,
      height: 400,
    });
  });

  it('puts the screen above the touch buttons on an upright phone', () => {
    const rect = stageRect({
      width: 390,
      height: 844,
      safe: { ...noInsets, top: 47 },
      portrait: true,
      buttonScale: 1,
    });
    expect(rect).toMatchObject({ x: 0, width: 390, height: 219 });
    expect(rect.y).toBeGreaterThanOrEqual(47 + 56);
  });

  it('tells upright screens apart', () => {
    expect(isPortrait(390, 844)).toBe(true);
    expect(isPortrait(844, 390)).toBe(false);
  });

  it('rests the stick in the bottom-left corner, inside the safe area', () => {
    const position = stickRestPosition({
      zoneHeight: 375,
      safe: { ...noInsets, left: 44 },
      stageBottom: 375,
      portrait: false,
      buttonScale: 1,
    });
    expect(position).toEqual({ x: 44 + 64 + 26, y: 375 - 64 - 26 });
  });
});
