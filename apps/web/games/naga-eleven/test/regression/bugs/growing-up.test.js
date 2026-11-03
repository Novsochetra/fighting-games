import { describe, expect, it } from 'vitest';
import { SHIRTS } from '../../../src/art/portraits/clothes.js';
import { AGES, recipeFor } from '../../../src/render/portraits/cast/index.js';
import { composePortrait } from '../../../src/render/portraits/compose.js';
import { LEGEND } from '../../../src/render/portraits/legend.js';

// From chapter 2 to 4 Sochetra was the same face in the same red shirt, his school's kit a red
// next to his country's, and Dara at nineteen and at twenty-four could not be told apart

const colours = (recipe) =>
  composePortrait(recipe, 'neutral').cells.map((letter) =>
    letter === null ? null : (recipe.palette[LEGEND[letter]] ?? recipe.palette.outline),
  );

function changed(character, from, to) {
  const before = colours(recipeFor({ character, age: from }));
  const after = colours(recipeFor({ character, age: to }));

  return before.filter((colour, i) => colour !== after[i]).length / before.length;
}

const rgbOf = (hex) => hex.match(/\w\w/g).map((pair) => parseInt(pair, 16));

const colourGap = (one, other) =>
  Math.hypot(...rgbOf(one).map((value, channel) => value - rgbOf(other)[channel]));

describe('the friends who grow up', () => {
  it('look older at each age, Sochetra and Dara alike', () => {
    for (const character of ['sochetra', 'dara']) {
      AGES.slice(1).forEach((age, i) => {
        expect(changed(character, AGES[i], age), `${character} ${age}`).toBeGreaterThan(0.12);
      });
    }
  });

  it('stand taller in the frame as they grow', () => {
    for (const character of ['sochetra', 'dara', 'rithy']) {
      const lifts = AGES.map((age) => recipeFor({ character, age }).lift ?? 0);

      lifts.slice(1).forEach((lift, i) => expect(lift, character).toBeLessThan(lifts[i]));
    }
  });

  it('put Sochetra and Rithy in the national kit for their country, from chapter 3', () => {
    const school = recipeFor({ character: 'sochetra', age: 'teen' });

    for (const character of ['sochetra', 'rithy']) {
      for (const age of ['young', 'adult']) {
        const recipe = recipeFor({ character, age });

        expect(recipe.palette.cloth, `${character} ${age}`).toBe(SHIRTS.cambodia.cloth);
        expect(recipe.collar).toBe('vee');
        expect(recipe.chestProps?.length).toBeGreaterThan(0);
      }
    }

    expect(colourGap(school.palette.cloth, SHIRTS.cambodia.cloth)).toBeGreaterThan(60);
  });
});
