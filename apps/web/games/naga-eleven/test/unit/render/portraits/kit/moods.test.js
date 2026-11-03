import { describe, expect, it } from 'vitest';
import { MOODS } from '../../../../../src/render/portraits/cast/index.js';
import { kitMoodOf } from '../../../../../src/render/portraits/kit/moods.js';

const ALL = ['neutral', 'shout', 'grin', 'hurt', 'angry', 'surprised', 'calm'];

describe('the mood a kit face shows', () => {
  it('has a face for every mood a portrait is asked for', () => {
    for (const mood of MOODS) {
      expect(ALL, mood).toContain(kitMoodOf(mood, ALL));
    }
  });

  it('shows a story mood as the face nearest it', () => {
    expect(kitMoodOf('happy', ALL)).toBe('grin');
    expect(kitMoodOf('determined', ALL)).toBe('angry');
    expect(kitMoodOf('shocked', ALL)).toBe('surprised');
    expect(kitMoodOf('cry', ALL)).toBe('hurt');
  });

  it('shows its own moods as they are', () => {
    expect(kitMoodOf('shout', ALL)).toBe('shout');
    expect(kitMoodOf('calm', ALL)).toBe('calm');
  });

  it('looks on, determined, where a face has no neutral', () => {
    expect(kitMoodOf('neutral', ALL.slice(1))).toBe('angry');
    expect(kitMoodOf('nonsense', ALL.slice(1))).toBe('angry');
  });
});
