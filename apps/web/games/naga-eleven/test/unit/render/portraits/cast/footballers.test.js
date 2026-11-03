import { describe, expect, it } from 'vitest';
import {
  AGES,
  CAST,
  GROWING_UP,
  recipeFor,
} from '../../../../../src/render/portraits/cast/index.js';
import { footballer, footballerKey } from '../../../../../src/render/portraits/cast/footballers.js';
import { composePortrait } from '../../../../../src/render/portraits/compose.js';
import { cellAt } from '../../../../../src/render/portraits/grid.js';
import { HAIR_LETTERS } from '../../../../../src/render/portraits/legend.js';

const NAMED = [
  ...Object.keys(CAST).map((character) => recipeFor({ character })),
  ...Object.keys(GROWING_UP).flatMap((character) =>
    AGES.map((age) => recipeFor({ character, age })),
  ),
];

const squad = (age, team, kit = team) =>
  Array.from({ length: 11 }, (_, place) =>
    footballer({ age, team, kit, wear: place === 0 ? 'keeper' : 'home', place }),
  );

// a beard is hair on the chin, under the mouth
function bearded(recipe) {
  const grid = composePortrait(recipe, 'neutral');
  const chin = recipe.mouth.y + 4 + (recipe.lift ?? 0);

  return [26, 28, 30, 33, 35, 37].some((x) => HAIR_LETTERS.has(cellAt(grid, x, chin)));
}

const faceOf = (recipe) =>
  JSON.stringify([recipe.hair, recipe.eyes, recipe.nose, recipe.head, recipe.brows.look]);

describe('a footballer’s face', () => {
  it('is a primary-school boy low in the frame, then a lad, then a man standing taller', () => {
    const shapes = AGES.map((age) => footballer({ age, team: 'chrey-school', place: 3 }));

    expect(shapes.map(({ build }) => build)).toEqual(['child', 'teen', 'broad', 'big']);
    expect(shapes.map(({ lift }) => lift ?? 0)).toEqual([4, 2, 0, -1]);
    expect(shapes[0].head).toBe('child');
    expect(shapes.every((recipe) => recipe.sex === 'male')).toBe(true);
    expect(shapes.map(({ age }) => age)).toEqual(AGES);
  });

  it('is the same man every time he is asked for', () => {
    const variant = { age: 'adult', team: 'brazil', kit: 'brazil', wear: 'home', place: 7 };

    expect(footballer(variant)).toEqual(footballer(variant));
  });

  it('differs from his mates', () => {
    for (const [age, team] of [
      ['child', 'royal-kids'],
      ['teen', 'kampot-high'],
      ['young', 'japan-youth'],
      ['adult', 'nigeria'],
    ]) {
      const faces = new Set(squad(age, team).map(faceOf));

      expect(faces.size, team).toBe(11);
    }
  });

  it('wears no hair of anyone with a name', () => {
    for (const team of ['chrey-school', 'cambodia', 'brazil', 'iran', 'mexico', 'germany']) {
      for (const recipe of squad('adult', team)) {
        expect(
          NAMED.some((named) => named.hair === recipe.hair),
          team,
        ).toBe(false);
      }
    }
  });

  it('grows a beard on some grown men but never on a keeper, who would be Farhad', () => {
    const teams = ['brazil', 'iran', 'mexico', 'nigeria'];
    const players = teams.flatMap((team) => squad('adult', team));

    expect(players.filter(bearded).length).toBeGreaterThan(3);
    expect(players.filter((recipe) => recipe.frontProps?.length).some(bearded)).toBe(false);
  });

  it('keeps boys and lads clean-shaven', () => {
    for (const age of ['child', 'teen']) {
      for (const recipe of squad(age, 'nigeria')) {
        expect(recipe.skinDetails ?? [], age).toEqual([]);
        expect(recipe.faceProps ?? [], age).toEqual([]);
      }
    }
  });

  it('is keyed by everything that picks it', () => {
    const variant = { team: 'iran-youth', kit: 'iran', wear: 'keeper-1', place: 0 };

    expect(footballerKey(variant)).toBe('iran-youth:iran:keeper-1:0');
    expect(footballerKey({ ...variant, place: 1 })).not.toBe(footballerKey(variant));
  });
});
