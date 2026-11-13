import { describe, expect, it } from 'vitest';

import { addsTime, cameraModeOf, movesCamera } from '../../../../src/render/cinema/mode.js';

describe('the cinematic camera setting', () => {
  it('is full on auto, and off for a device that asks for less motion', () => {
    expect(cameraModeOf('auto')).toBe('full');
    expect(cameraModeOf('auto', { reducedMotion: true })).toBe('off');
  });

  it('keeps what the player picked, even on a device asking for less motion', () => {
    expect(cameraModeOf('full', { reducedMotion: true })).toBe('full');
    expect(cameraModeOf('short')).toBe('short');
    expect(cameraModeOf('off')).toBe('off');
  });

  it('treats a setting it does not know as auto', () => {
    expect(cameraModeOf(undefined)).toBe('full');
    expect(cameraModeOf('wild', { reducedMotion: true })).toBe('off');
  });

  it('moves the camera on full and short, and adds time only on full', () => {
    expect([movesCamera('full'), movesCamera('short'), movesCamera('off')]).toEqual([
      true,
      true,
      false,
    ]);
    expect([addsTime('full'), addsTime('short'), addsTime('off')]).toEqual([true, false, false]);
  });
});
