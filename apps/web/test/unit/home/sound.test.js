import { describe, expect, it, vi } from 'vitest';
import { CUES, cueNames } from '../../../src/home/sound-cues.js';
import { MASTER_VOLUME, createSoundPlayer } from '../../../src/home/sound-player.js';
import { SILENCE, envelopeSteps, frequencySteps } from '../../../src/home/sound-synth.js';
import { createFakeAudioContext } from '../../support/fake-audio.js';

const voices = Object.values(CUES).flat();

describe('CUES', () => {
  it('names a cue for every moment the home page makes a sound', () => {
    expect(cueNames().sort()).toEqual(
      [
        'favoriteOff',
        'favoriteOn',
        'land',
        'launch',
        'move',
        'segment',
        'sheetClose',
        'sheetOpen',
        'soundOn',
      ].sort(),
    );
  });

  it('keeps every voice quiet, short and audible', () => {
    for (const voice of voices) {
      expect(voice.gain).toBeGreaterThan(0);
      expect(voice.gain).toBeLessThanOrEqual(0.1);
      expect(voice.attack).toBeLessThan(voice.duration);
      expect(voice.start + voice.duration).toBeLessThanOrEqual(1);
      voice.frequency.forEach((hertz) => expect(hertz).toBeGreaterThanOrEqual(20));
    }
  });

  it('keeps the moving tick under a fifth of a second, so holding an arrow stays crisp', () => {
    const longest = Math.max(...CUES.move.map((voice) => voice.start + voice.duration));
    expect(longest).toBeLessThan(0.2);
  });
});

describe('envelopeSteps and frequencySteps', () => {
  const voice = { gain: 0.1, attack: 0.01, duration: 0.2, frequency: [400, 800] };

  it('rises to the voice gain, then fades to silence by its end', () => {
    expect(envelopeSteps(voice, 1)).toEqual([
      { type: 'set', value: SILENCE, time: 1 },
      { type: 'linear', value: 0.1, time: 1.01 },
      { type: 'exponential', value: SILENCE, time: 1.2 },
    ]);
  });

  it('glides between two pitches and holds a single one', () => {
    expect(frequencySteps(voice, 0)).toEqual([
      { type: 'set', value: 400, time: 0 },
      { type: 'exponential', value: 800, time: 0.2 },
    ]);
    expect(frequencySteps({ ...voice, frequency: [440, 440] }, 0)).toEqual([
      { type: 'set', value: 440, time: 0 },
    ]);
  });
});

describe('createSoundPlayer', () => {
  const setup = ({ enabled = true, state } = {}) => {
    const context = createFakeAudioContext({ state });
    const createContext = vi.fn(() => context);
    const player = createSoundPlayer({ createContext, isEnabled: () => enabled });
    return { context, createContext, player };
  };

  it('makes no audio context until the first cue', () => {
    const { createContext, player } = setup();
    expect(createContext).not.toHaveBeenCalled();
    expect(player.play('move')).toBe(true);
    player.play('move');
    expect(createContext).toHaveBeenCalledOnce();
  });

  it('starts one source per voice of the cue, through the master volume', () => {
    const { context, player } = setup();
    player.play('launch');
    expect(context.started).toHaveLength(CUES.launch.length);
    expect(context.gains[0].gain.value).toBe(MASTER_VOLUME);
  });

  it('stays silent when sound is off or the cue is unknown', () => {
    const muted = setup({ enabled: false });
    expect(muted.player.play('move')).toBe(false);
    expect(muted.createContext).not.toHaveBeenCalled();
    expect(setup().player.play('nope')).toBe(false);
  });

  it('wakes a context the browser suspended', () => {
    const { context, player } = setup({ state: 'suspended' });
    player.play('move');
    expect(context.resume).toHaveBeenCalled();
  });

  it('does nothing in a browser without Web Audio', () => {
    const player = createSoundPlayer({ createContext: () => null, isEnabled: () => true });
    expect(player.play('move')).toBe(false);
  });
});
