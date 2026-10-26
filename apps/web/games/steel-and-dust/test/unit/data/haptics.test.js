import { describe, expect, it } from 'vitest';
import { HAPTIC_CUES } from '../../../src/data/haptics.js';

const isWholeMs = (value) => Number.isInteger(value) && value > 0;

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
});
