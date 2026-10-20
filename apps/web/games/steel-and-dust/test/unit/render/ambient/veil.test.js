import { describe, expect, it } from 'vitest';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../../../../src/config.js';
import { SAMPLE_EFFECTS, rectsOf, recordEffect } from './ambient-recorder.js';

const veil = SAMPLE_EFFECTS.veil;
const CALM = 2381;
const FULL = 1652;
const wash = (tick) => rectsOf(veil, { tick })[0];
const bankTop = (tick) =>
  Math.min(
    ...rectsOf(veil, { tick })
      .slice(1)
      .map((rect) => rect.y),
  );

describe('ambient veil', () => {
  it('washes the whole view in dust, thicker as the storm rises', () => {
    for (const tick of [CALM, FULL]) {
      expect(wash(tick)).toMatchObject({ x: 0, y: 0, width: VIEW_WIDTH, height: VIEW_HEIGHT });
    }
    expect(wash(CALM).alpha).toBeLessThan(0.02);
    expect(wash(FULL).alpha).toBeGreaterThan(0.25);
  });

  it('rolls a dust bank along the foot of the canyon that climbs as the storm rises', () => {
    expect(bankTop(FULL)).toBeLessThan(bankTop(CALM));
    for (const rect of rectsOf(veil, { tick: FULL }).slice(1)) {
      expect(rect.y + rect.height).toBeLessThanOrEqual(veil.y + veil.height);
    }
  });

  it('blows the billows of the bank along with the wind and the camera', () => {
    const still = recordEffect(veil, { tick: FULL }).log;
    expect(recordEffect(veil, { tick: FULL + 8 }).log).not.toEqual(still);
    expect(recordEffect(veil, { tick: FULL, cameraX: 40 }).log).not.toEqual(still);
    const calmAir = { ...veil, wind: 0, drift: 0 };
    expect(recordEffect(calmAir, { tick: FULL, cameraX: 40 }).log).toEqual(
      recordEffect(calmAir, { tick: FULL }).log,
    );
  });
});
