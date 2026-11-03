import { describe, expect, it } from 'vitest';
import {
  happyArc,
  lowerLid,
  mirrorEye,
  squeezedShut,
  wideOpen,
} from '../../../../src/render/portraits/eye-moods.js';

const EYE = ['.OOOO.', 'OwLjiw', '.wiiw.', '..OO..'];

describe('the eyes of each mood', () => {
  it('brings the lash down where the lid drops', () => {
    expect(lowerLid(EYE, [0, 1, 1, 1, 1, 0])).toEqual(['.2222.', 'OOOOOw', '.wiiw.', '..OO..']);
  });

  it('opens wide in shock with a dot of a pupil', () => {
    const shocked = wideOpen(EYE);

    expect(shocked).toHaveLength(EYE.length + 1);
    expect(shocked.join('')).not.toMatch(/[ilL]/);
    expect(shocked.join('').match(/j/g)).toHaveLength(4);
  });

  it('keeps the shine on the side the light comes from when an eye is mirrored', () => {
    const right = mirrorEye(EYE);

    expect(right[1]).toBe('wLjiwO');
  });

  it('closes into an arc when happy and squeezes shut when crying, as wide as the eye', () => {
    for (const width of [7, 8]) {
      expect(happyArc(width).every((row) => row.length === width)).toBe(true);
      expect(squeezedShut(width).every((row) => row.length === width)).toBe(true);
    }
  });
});
