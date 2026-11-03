import { describe, expect, it } from 'vitest';
import { unlockAudio } from '../../../../src/audio/context/unlock.js';
import { setBed, setCrowdLevel } from '../../../../src/audio/crowd/bed.js';
import { createAudioState } from '../../../../src/audio/state.js';
import { CROWD } from '../../../../src/data/audio.js';
import { FakeAudioContext, fakeTimers } from '../../../support/fake-audio.js';

function unlocked() {
  const audio = createAudioState({ AudioContext: FakeAudioContext, timers: fakeTimers() });

  unlockAudio(audio);

  return audio;
}

describe('the crowd bed', () => {
  it('waits for the first tap, and starts a looping murmur once a crowd is wanted', () => {
    const silent = createAudioState({ AudioContext: FakeAudioContext, timers: fakeTimers() });

    setCrowdLevel(silent, 1);

    expect(silent.bed).toBe(null);

    const audio = unlocked();

    setCrowdLevel(audio, 1);

    expect(audio.bed.source.loop).toBe(true);
    expect(audio.bed.source.startAt).toBe(0);
  });

  it('follows the crowd, from its murmuring floor up', () => {
    const audio = unlocked();

    setCrowdLevel(audio, 1);

    const [target] = audio.bed.level.gain.events;

    expect(target.value).toBeCloseTo(CROWD.floor * CROWD.bedPeak);
  });

  it('spares the automation a change too small to hear', () => {
    const audio = unlocked();

    setBed(audio, 0.5);
    setBed(audio, 0.505);
    setBed(audio, 0.6);

    expect(audio.bed.level.gain.events).toHaveLength(2);
  });

  it('fades out and stops with nobody there, and starts afresh when the crowd comes back', () => {
    const audio = unlocked();

    setCrowdLevel(audio, 1);

    const first = audio.bed;

    setCrowdLevel(audio, 0);

    expect(audio.bed).toBe(null);
    expect(first.source.stopAt).toBeGreaterThan(0);

    setCrowdLevel(audio, 0.5);

    expect(audio.bed).not.toBe(first);
  });

  it('takes a crowd level that is no number as nobody', () => {
    const audio = unlocked();

    setCrowdLevel(audio, Number.NaN);

    expect(audio.crowdLevel).toBe(0);
    expect(audio.bed).toBe(null);
  });
});
