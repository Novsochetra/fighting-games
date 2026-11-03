import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../../../src/data/story/index.js';
import {
  AGES,
  CAST,
  GROWING_UP,
  VILLAGER_COUNT,
  recipeFor,
} from '../../../src/render/portraits/cast/index.js';
import { createScene, currentLine, isSceneDone } from '../../../src/story/index.js';
import { press } from '../../support/story-fixtures.js';

// Villagers' faces were picked as `hash % 8` from five, so faces 0 and 5 were both the elder:
// Bopha, a little girl, and 5 of the 7 other villager lines were drawn as a grey-haired elder, and
// the Neighbour watching beside Ta Sok looked just like him.

const SCENES = CHAPTERS.flatMap((chapter) =>
  Object.entries(chapter.scenes).map(([id, scene]) => ({ id, scene, heroAge: chapter.heroAge })),
);

function portraitsOf(scene, heroAge) {
  const state = createScene(scene, { heroAge });
  const seen = [];

  while (!isSceneDone(state)) {
    const line = currentLine(state);

    seen.push({ line: scene.lines[line.index], portrait: line.portrait });

    while (!isSceneDone(state) && currentLine(state).index === line.index) {
      press(state);
    }
  }

  return seen;
}

const villagerLines = ({ scene, heroAge }) =>
  portraitsOf(scene, heroAge).filter(({ line }) => line.speaker === 'villager');

const rgbOf = (hex) => hex.match(/\w\w/g).map((pair) => parseInt(pair, 16));

const colourGap = (one, other) =>
  Math.hypot(...rgbOf(one).map((value, channel) => value - rgbOf(other)[channel]));

// a shirt this close in colour to one somebody with a name wears reads as theirs at a glance
const NEAREST_SHIRT = 48;

const NAMED = [
  ...Object.keys(CAST).map((character) => recipeFor({ character })),
  ...Object.keys(GROWING_UP).flatMap((character) =>
    AGES.map((age) => recipeFor({ character, age })),
  ),
];

describe('a villager’s face', () => {
  it('fits the age the line gives', () => {
    const lines = SCENES.flatMap(villagerLines).filter(({ line }) => line.age);

    expect(lines.length).toBeGreaterThan(5);

    for (const { line, portrait } of lines) {
      expect(recipeFor(portrait).age).toBe(line.age);
    }
  });

  it('draws Bopha as a little girl', () => {
    const epilogue = SCENES.find(({ id }) => id === 'ch4-epilogue-chrey');

    for (const { portrait } of villagerLines(epilogue)) {
      expect(recipeFor(portrait)).toMatchObject({ age: 'child', sex: 'female', head: 'child' });
    }
  });

  it('is never another villager’s in the same scene', () => {
    const crowd = ['Fan', 'Driver', 'Seller', 'Monk'].map((en) => ({
      speaker: 'villager',
      name: { en, km: en },
      age: 'adult',
      text: { en: 'Go, Chrey!', km: 'Go, Chrey!' },
    }));
    const faces = (scene) => {
      const byName = new Map(
        villagerLines({ scene, heroAge: 'adult' }).map(({ line, portrait }) => [
          line.name?.en ?? line.text.en,
          portrait.variant,
        ]),
      );

      return [...byName.values()];
    };

    expect(new Set(faces({ backdrop: 'black', lines: crowd })).size).toBe(crowd.length);

    for (const scene of SCENES) {
      const shown = faces(scene.scene);

      expect(new Set(shown).size).toBe(shown.length);
    }
  });

  it('wears neither the hair nor the shirt of anyone with a name', () => {
    for (let variant = 0; variant < VILLAGER_COUNT; variant += 1) {
      const face = recipeFor({ character: 'villager', variant });

      for (const named of NAMED) {
        expect(face.hair, `villager face ${variant}`).not.toBe(named.hair);
        expect(
          colourGap(face.palette.cloth, named.palette.cloth),
          `villager face ${variant}`,
        ).toBeGreaterThan(NEAREST_SHIRT);
      }
    }
  });
});
