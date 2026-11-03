import { describe, expect, it } from 'vitest';
import { voicePitch } from '../../../../src/audio/cues/voice.js';
import { VOICES } from '../../../../src/data/audio.js';
import { CHARACTERS } from '../../../../src/data/characters.js';

describe('the dialogue blips', () => {
  it('give every speaker in the cast a pitch of their own', () => {
    for (const id of Object.keys(CHARACTERS)) {
      expect(VOICES.speakers[id], id).toBeGreaterThan(0);
    }
  });

  it('tick higher for a child than for the same speaker grown up', () => {
    const child = voicePitch({ speaker: 'sochetra', age: 'child' });
    const teen = voicePitch({ speaker: 'sochetra', age: 'teen' });
    const adult = voicePitch({ speaker: 'sochetra', age: 'adult' });

    expect(child).toBeGreaterThan(teen);
    expect(teen).toBeGreaterThan(adult);
    expect(voicePitch({ speaker: 'villager', child: true })).toBeGreaterThan(
      voicePitch({ speaker: 'villager' }),
    );
  });

  it('tick low for the grandfather and at the base pitch for a speaker it does not know', () => {
    expect(voicePitch({ speaker: 'ta-sok' })).toBeLessThan(voicePitch({ speaker: 'neary' }));
    expect(voicePitch({ speaker: 'stranger' })).toBe(VOICES.base);
  });
});
