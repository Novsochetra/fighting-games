import { describe, expect, it } from 'vitest';
import { CUES, CUE_NAMES } from '../../../src/audio/cues/index.js';
import { createAudio } from '../../../src/audio/index.js';
import { runningAudio } from '../../support/fake-audio.js';

const OPTIONS = {
  kick: [{ power: 0 }, { power: 1 }, {}],
  whistle: [{ kind: 'short' }, { kind: 'restart' }, { kind: 'long' }, { kind: 'final' }, {}],
  post: [{ bar: true }, {}],
  save: [{ parried: true }, {}],
  tackle: [{ won: false }, {}],
  blip: [{ speaker: 'ta-sok' }, { speaker: 'sochetra', age: 'child' }, { child: true }, {}],
  roar: [{ level: 0.2 }, {}],
};

const optionsOf = (cue) => OPTIONS[cue] ?? [{}];

describe('play', () => {
  it.each(CUE_NAMES)('builds %s in every form without a node the browser would refuse', (cue) => {
    const { audio, context, step } = runningAudio(createAudio);

    for (const options of optionsOf(cue)) {
      const built = context.nodes.length;

      expect(audio.play(cue, options)).toBe(true);
      expect(context.nodes.length).toBeGreaterThan(built);
      step(1);
    }
  });

  it('starts every source it makes just after now, and stops each within a few seconds', () => {
    const { audio, context } = runningAudio(createAudio);

    const before = context.sources().length;

    context.currentTime = 2;

    for (const cue of CUE_NAMES) {
      audio.play(cue);
      context.currentTime += 0.05;
    }

    for (const source of context.sources().slice(before)) {
      expect(source.startAt).toBeGreaterThanOrEqual(2);
      expect(source.stopAt - source.startAt).toBeLessThan(6);
    }
  });

  it('knows each cue the README asks for', () => {
    const wanted = ['kick', 'pass', 'loft', 'header', 'post', 'net', 'whistle', 'ooh', 'roar'];
    const more = ['groan', 'save', 'tackle', 'duel', 'charge', 'impact', 'cursor', 'confirm'];
    const rest = ['back', 'levelUp', 'moveUnlocked', 'blip', 'cone', 'target', 'focusBeat'];

    expect(Object.keys(CUES)).toEqual(
      expect.arrayContaining([...wanted, ...more, ...rest, 'perfect']),
    );
  });

  it('plays a cue asked for twice in one tick once', () => {
    const { audio } = runningAudio(createAudio);

    expect(audio.play('pass')).toBe(true);
    expect(audio.play('pass')).toBe(false);
  });

  it('refuses a cue it does not know', () => {
    const { audio } = runningAudio(createAudio);

    expect(audio.play('vuvuzela')).toBe(false);
  });
});
