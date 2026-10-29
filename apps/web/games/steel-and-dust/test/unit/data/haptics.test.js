import { describe, expect, it } from 'vitest';
import { TICK_MS } from '../../../src/config.js';
import { HAPTIC_CUES } from '../../../src/data/haptics.js';
import { ULTIMATES } from '../../../src/data/ultimates/index.js';

const isWholeMs = (value) => Number.isInteger(value) && value > 0;
const padLength = (rumbles) => rumbles.reduce((sum, { wait = 0, ms }) => sum + wait + ms, 0);

describe('haptic cues', () => {
  it('gives every cue a phone pattern of whole milliseconds', () => {
    for (const { phone } of Object.values(HAPTIC_CUES)) {
      expect([phone].flat().every(isWholeMs)).toBe(true);
    }
  });

  // browsers refuse a rumble over five seconds or a magnitude outside 0 to 1
  it('keeps every gamepad rumble to what browsers play', () => {
    for (const { pad } of Object.values(HAPTIC_CUES)) {
      expect(pad.length).toBeGreaterThan(0);

      for (const { wait = 0, ms, strong, weak } of pad) {
        expect(wait).toBeGreaterThanOrEqual(0);
        expect(isWholeMs(ms) && ms <= 5000).toBe(true);
        expect([strong, weak].every((level) => level >= 0 && level <= 1)).toBe(true);
        expect(strong + weak).toBeGreaterThan(0);
      }
    }
  });

  // a press under the thumb comes just before the blow it throws lands, and must not feel like it
  it('ticks a touch control shorter than any blow lands', () => {
    expect(HAPTIC_CUES.tap.phone).toBeLessThan(HAPTIC_CUES.hit.phone);
    expect(padLength(HAPTIC_CUES.tap.pad)).toBeLessThan(padLength(HAPTIC_CUES.hit.pad));
  });

  // the first blow can land on the cut-in's last tick, and its rumble would cut the swell short
  it("ends the ultimate's swell within every hero's cut-in", () => {
    const { phone, pad } = HAPTIC_CUES.ultimate;
    const phoneLength = phone.reduce((sum, ms) => sum + ms, 0);

    for (const { intro } of Object.values(ULTIMATES)) {
      const firstBlowMs = (intro - 1) * TICK_MS;

      expect(padLength(pad)).toBeLessThan(firstBlowMs);
      expect(phoneLength).toBeLessThan(firstBlowMs);
    }
  });
});
