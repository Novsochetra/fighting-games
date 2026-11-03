import { describe, expect, it } from 'vitest';
import { busLevels, loudness, mergeVolumes } from '../../../../src/audio/context/volumes.js';
import { createAudio } from '../../../../src/audio/index.js';
import { AUDIO } from '../../../../src/data/audio.js';
import { runningAudio } from '../../../support/fake-audio.js';

describe('volumes', () => {
  it('follow the square of the slider, so halfway sounds about half as loud', () => {
    expect(loudness(0)).toBe(0);
    expect(loudness(0.5)).toBe(0.25);
    expect(loudness(1)).toBe(1);
  });

  it('keep a slider to 0..1', () => {
    expect(loudness(-1)).toBe(0);
    expect(loudness(3)).toBe(1);
  });

  it('set the effects and the music buses apart, each under its own top level', () => {
    expect(busLevels({ sound: 1, music: 0 })).toEqual({ effects: AUDIO.levels.effects, music: 0 });
    expect(busLevels({ sound: 0, music: 1 })).toEqual({ effects: 0, music: AUDIO.levels.music });
  });

  it('change only the volumes given, and ignore one that is no number', () => {
    const start = { sound: 1, music: 1 };

    expect(mergeVolumes(start, { music: 0.4 })).toEqual({ sound: 1, music: 0.4 });
    expect(mergeVolumes(start, { sound: 'loud', music: Number.NaN })).toEqual(start);
    expect(mergeVolumes(start, { sound: 2 })).toEqual({ sound: 1, music: 1 });
    expect(mergeVolumes(start)).toEqual(start);
  });

  it('move the buses smoothly to their new levels', () => {
    const { audio, context } = runningAudio(createAudio);
    const targets = () =>
      context.nodes
        .filter((node) => node.kind === 'gain')
        .flatMap((node) => node.gain.events.filter((event) => event.kind === 'target'))
        .map((event) => event.value);

    audio.setVolumes({ sound: 0.5, music: 0 });

    expect(targets()).toEqual(expect.arrayContaining([AUDIO.levels.effects * 0.25, 0]));
  });
});
