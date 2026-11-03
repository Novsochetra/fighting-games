import { describe, expect, it } from 'vitest';
import { createAudio } from '../../../../src/audio/index.js';
import { createMatch } from '../../../../src/sim/create-match.js';
import { runningAudio } from '../../../support/fake-audio.js';

const GOAL = { type: 'goal', team: 0, scorer: 9, move: null };

const roarsOf = (context, before) =>
  context.nodes.slice(before).filter((node) => node.kind === 'buffer' && node.buffer.duration > 2);

describe('hearing a match', () => {
  it('plays what it heard and says what that was', () => {
    const { audio } = runningAudio(createAudio);
    const cues = audio.hear([GOAL], createMatch({ seed: 1, humanTeam: 0 }));

    expect(cues.map((each) => each.cue)).toEqual(['net', 'roar']);
    expect(audio.stats().voices).toBe(2);
  });

  it('makes no cheer on a field with nobody watching, but still swishes the net', () => {
    const { audio } = runningAudio(createAudio);

    audio.setCrowd(0);
    audio.hear([GOAL], createMatch({ seed: 1, humanTeam: 0 }));

    expect(audio.stats().voices).toBe(1);
  });

  it('cheers as big as its crowd', () => {
    const peakOf = (crowd) => {
      const { audio, context } = runningAudio(createAudio);

      audio.setCrowd(crowd);

      const before = context.nodes.length;

      audio.hear([GOAL], createMatch({ seed: 1, humanTeam: 0 }));

      const [roar] = roarsOf(context, before);
      const shaped = roar.outputs[0].outputs[0];

      return Math.max(...shaped.gain.events.map((event) => event.value));
    };

    expect(peakOf(1)).toBeCloseTo(peakOf(0.5) * 2);
  });

  it('keeps listening while suspended, so it picks up where the match is', () => {
    const { audio } = runningAudio(createAudio);
    const match = createMatch({ seed: 1, humanTeam: 0 });

    audio.pause();

    expect(audio.hear([GOAL], match).map((each) => each.cue)).toEqual(['net', 'roar']);
    expect(audio.stats().voices).toBe(0);
  });

  it('ignores what is no match, and events that are no list', () => {
    const { audio } = runningAudio(createAudio);

    expect(audio.hear([GOAL], null)).toEqual([]);
    expect(audio.hear('goal', createMatch({ seed: 1, humanTeam: 0 }))).toEqual([]);
  });
});
