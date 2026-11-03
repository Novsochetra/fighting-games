import { describe, expect, it } from 'vitest';
import {
  AGES,
  CAST,
  GROWING_UP,
  VILLAGER_COUNT,
  hasPortrait,
  recipeFor,
} from '../../../../../src/render/portraits/cast/index.js';

describe('the cast of portraits', () => {
  it('has a face for everyone in the bible who has one', () => {
    const ids = [...Object.keys(GROWING_UP), ...Object.keys(CAST)];

    expect(ids.sort()).toEqual(
      [
        'announcer',
        'coach-bora',
        'coach-sokha',
        'coach-vannak',
        'dara',
        'farhad',
        'haruto',
        'lukas',
        'minjun',
        'neary',
        'rafael',
        'rithy',
        'sochetra',
        'ta-sok',
      ].sort(),
    );
  });

  it('grows Sochetra, Dara and Rithy up through four ages, young when no age is asked', () => {
    for (const character of Object.keys(GROWING_UP)) {
      const looks = AGES.map((age) => recipeFor({ character, age }));

      expect(new Set(looks).size).toBe(AGES.length);
      expect(recipeFor({ character })).toBe(recipeFor({ character, age: 'young' }));
    }
  });

  it('picks a villager face by variant, wrapping round the faces there are', () => {
    expect(VILLAGER_COUNT).toBeGreaterThanOrEqual(4);
    expect(recipeFor({ character: 'villager', variant: 1 })).not.toBe(
      recipeFor({ character: 'villager', variant: 0 }),
    );
    expect(recipeFor({ character: 'villager', variant: VILLAGER_COUNT + 1 })).toBe(
      recipeFor({ character: 'villager', variant: 1 }),
    );
    expect(recipeFor({ character: 'villager' })).toBe(
      recipeFor({ character: 'villager', variant: 0 }),
    );
  });

  it('has no recipe for someone it does not know, nor for the narrator', () => {
    expect(recipeFor({ character: 'nobody' })).toBeNull();
    expect(recipeFor({ character: 'narrator' })).toBeNull();
    expect(hasPortrait('narrator')).toBe(false);
    expect(hasPortrait('villager')).toBe(true);
    expect(hasPortrait('rithy')).toBe(true);
  });
});
