import { describe, expect, it } from 'vitest';
import { portraitOf } from '../../../../src/render/duel/portrait-card.js';

const player = (overrides) => ({
  id: 'royal-kids-2',
  team: 1,
  index: 8,
  slotIndex: 1,
  role: 'defender',
  star: null,
  ...overrides,
});

describe('the face a duel card shows', () => {
  it('is a star’s own, at the hero’s age for the friends who grow up with him', () => {
    expect(portraitOf(player({ star: 'rithy' }), { mood: 'determined', heroAge: 'child' })).toEqual(
      {
        character: 'rithy',
        mood: 'determined',
        age: 'child',
      },
    );
    expect(portraitOf(player({ star: 'haruto' }), { mood: 'smirk', heroAge: 'young' })).toEqual({
      character: 'haruto',
      mood: 'smirk',
      age: undefined,
    });
  });

  it('is a footballer of his side and the hero’s age for a plain player', () => {
    expect(portraitOf(player(), { mood: 'determined', heroAge: 'child' })).toEqual({
      character: 'footballer',
      mood: 'determined',
      age: 'child',
      variant: { team: 'royal-kids', kit: 'royal-kids', wear: 'home', place: 1 },
    });
  });

  it('is a footballer too for a star the story has drawn no face for', () => {
    expect(portraitOf(player({ star: 'nobody' }), { mood: 'determined' }).character).toBe(
      'footballer',
    );
  });
});
