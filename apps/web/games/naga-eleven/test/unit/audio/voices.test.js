import { describe, expect, it } from 'vitest';
import { VOICE_CAP } from '../../../src/data/audio.js';
import { createAudio } from '../../../src/audio/index.js';
import { runningAudio } from '../../support/fake-audio.js';

const SPREAD = 0.04;

function playEach(audio, context, cues) {
  for (const cue of cues) {
    audio.play(cue, { power: 1 });
    context.currentTime += SPREAD;
  }
}

describe('the voice cap', () => {
  it('never holds more than its cap of voices however many cues come', () => {
    const { audio, context } = runningAudio(createAudio);
    const cues = ['kick', 'roar', 'whistle', 'impact', 'duel', 'charge', 'save', 'net', 'groan'];

    for (let i = 0; i < 6; i += 1) {
      playEach(audio, context, cues);

      expect(audio.stats().voices).toBeLessThanOrEqual(VOICE_CAP);
    }
  });

  it('keeps one letter blip at a time, each new one taking the last one over', () => {
    const { audio, context } = runningAudio(createAudio);

    playEach(audio, context, ['blip', 'blip', 'blip', 'blip']);

    expect(audio.stats().voices).toBe(1);
  });

  it('gives up a soft cue for a big one, and refuses a soft cue when all outrank it', () => {
    const { audio, context } = runningAudio(createAudio);
    const big = ['roar', 'whistle', 'duel', 'charge', 'impact', 'levelUp', 'moveUnlocked'];

    playEach(audio, context, ['ooh', 'loft', 'header', 'tackle']);
    playEach(audio, context, [...big, 'kick', 'save', 'post', 'net', 'groan']);

    const voices = () => audio.stats().voices;

    expect(voices()).toBe(VOICE_CAP);
    expect(audio.play('cursor')).toBe(false);
    expect(audio.play('roar')).toBe(true);
    expect(voices()).toBe(VOICE_CAP);
  });

  it('fades a stolen voice out at once and stops its sources', () => {
    const { audio, context } = runningAudio(createAudio);

    audio.play('blip');

    const first = context.sources().filter((source) => source.kind === 'oscillator');

    context.currentTime += SPREAD;
    audio.play('blip');

    for (const source of first) {
      expect(source.stopAt).toBeLessThan(context.currentTime + 0.1);
    }
  });

  it('lets the voices that have ended go, disconnecting what they built', () => {
    const { audio, context } = runningAudio(createAudio);

    audio.play('kick');
    context.currentTime += 5;
    audio.play('pass');

    expect(audio.stats().voices).toBe(1);
    expect(context.nodes.filter((node) => node.disconnected).length).toBeGreaterThan(3);
  });
});
