import { describe, expect, it } from 'vitest';
import { createVoice, envelope, releaseVoice, strikes, tone } from '../../../src/audio/nodes.js';
import { FakeAudioContext } from '../../support/fake-audio.js';

function voiceOn(context) {
  return createVoice({ context, chain: {}, output: context.destination });
}

describe('the building blocks', () => {
  it('shapes an envelope from silence to its peak and back', () => {
    const context = new FakeAudioContext();
    const node = envelope(voiceOn(context), {
      destination: context.destination,
      start: 1,
      attack: 0.1,
      peak: 0.5,
      hold: 0.2,
      decay: 0.4,
    });

    expect(node.gain.valueAt(1)).toBeLessThan(0.001);
    expect(node.gain.valueAt(1.1)).toBeCloseTo(0.5);
    expect(node.gain.valueAt(1.3)).toBeCloseTo(0.5);
    expect(node.gain.valueAt(1.8)).toBeLessThan(0.001);
  });

  it('keeps every strike of a roll in time order, rising on each', () => {
    const context = new FakeAudioContext();
    const times = [0, 0.04, 0.08, 0.12];
    const node = strikes(voiceOn(context), {
      destination: context.destination,
      times,
      peak: 0.3,
      decay: 0.2,
    });
    const eventTimes = node.gain.events.map((event) => event.time);

    expect(eventTimes).toEqual([...eventTimes].sort((first, second) => first - second));

    for (const time of times) {
      expect(node.gain.valueAt(time + 0.003)).toBeGreaterThan(0.2);
    }
  });

  it('counts how long a voice sounds by its last source', () => {
    const context = new FakeAudioContext();
    const voice = voiceOn(context);

    tone(voice, { from: 440, start: 0.5, duration: 1, destination: context.destination });
    tone(voice, { from: 220, start: 0, duration: 0.2, destination: context.destination });

    expect(voice.endsAt).toBe(1.5);
  });

  it('disconnects all a voice built once, however often it is let go', () => {
    const context = new FakeAudioContext();
    const voice = voiceOn(context);

    tone(voice, { from: 440, start: 0, duration: 1, destination: context.destination });
    releaseVoice(voice);
    releaseVoice(voice);

    expect(voice.nodes.every((node) => node.disconnected)).toBe(true);
  });
});
