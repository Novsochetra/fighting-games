import { describe, expect, it } from 'vitest';
import {
  AGES,
  CAST,
  GROWING_UP,
  MOODS,
  VILLAGER_COUNT,
} from '../../../../src/render/portraits/index.js';
import { recipeFor } from '../../../../src/render/portraits/cast/index.js';
import { composePortrait } from '../../../../src/render/portraits/compose.js';
import { LEGEND } from '../../../../src/render/portraits/legend.js';

const recipes = [
  ...Object.keys(GROWING_UP).flatMap((character) =>
    AGES.map((age) => [`${character} ${age}`, recipeFor({ character, age })]),
  ),
  ...Object.keys(CAST).map((character) => [character, recipeFor({ character })]),
  ...Array.from({ length: VILLAGER_COUNT }, (_, variant) => [
    `villager ${variant}`,
    recipeFor({ character: 'villager', variant }),
  ]),
];

describe('composing the portraits', () => {
  it('paints only letters its palette has a colour for', () => {
    for (const [name, recipe] of recipes) {
      for (const mood of MOODS) {
        const letters = new Set(composePortrait(recipe, mood).cells.filter(Boolean));
        const missing = [...letters].filter((letter) => !recipe.palette[LEGEND[letter]]);

        expect(missing, `${name} ${mood}`).toEqual([]);
      }
    }
  });

  it('rings every face with the outline', () => {
    for (const [name, recipe] of recipes) {
      const grid = composePortrait(recipe, 'neutral');
      const topRowOfFigure = grid.cells.findIndex(Boolean);

      expect(grid.cells[topRowOfFigure], name).toBe('O');
    }
  });

  it('builds the same face twice the same way', () => {
    const [, recipe] = recipes[0];

    expect(composePortrait(recipe, 'angry').cells).toEqual(composePortrait(recipe, 'angry').cells);
  });
});
