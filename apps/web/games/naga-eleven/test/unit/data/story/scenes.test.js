import { describe, expect, it } from 'vitest';
import { CHARACTERS } from '../../../../src/data/characters.js';
import { CHAPTERS } from '../../../../src/data/story/index.js';
import { AGES, BACKDROPS, KHMER, PORTRAIT_MOODS, SCENE_MOODS } from './readme-ids.js';
import { CLOSING_CARD } from '../../../../src/data/story/closing.js';

// a dialogue box holds about two rows of 8 px Silkscreen
const LONGEST_LINE = 110;

const scenes = CHAPTERS.flatMap((chapter) =>
  Object.entries(chapter.scenes).map(([id, scene]) => ({ id, scene, chapter })),
);

const lines = scenes.flatMap(({ id, scene }) => scene.lines.map((line) => ({ id, line })));

const offending = (test) => lines.filter(({ line }) => !test(line)).map(({ id }) => id);

const englishOf = (chapter, id) => chapter.scenes[id].lines.map((line) => line.text.en);

describe('every scene', () => {
  it('stands on a README backdrop with a README mood', () => {
    for (const { scene } of scenes) {
      expect(BACKDROPS).toContain(scene.backdrop);
      expect(SCENE_MOODS).toContain(scene.mood);
    }
  });

  it('has a few lines, a long chapter moment a dozen at most', () => {
    for (const { id, scene } of scenes) {
      expect(scene.lines.length, id).toBeGreaterThan(0);
      expect(scene.lines.length, id).toBeLessThanOrEqual(13);
    }
  });
});

describe('every line', () => {
  it('is spoken by someone in the cast, with a portrait mood and a side', () => {
    expect(offending((line) => Boolean(CHARACTERS[line.speaker]))).toEqual([]);
    expect(offending((line) => PORTRAIT_MOODS.includes(line.mood))).toEqual([]);
    expect(offending((line) => ['left', 'right'].includes(line.side))).toEqual([]);
  });

  it('is written in English and in Khmer', () => {
    expect(offending((line) => typeof line.text.en === 'string' && line.text.en.length)).toEqual(
      [],
    );
    expect(offending((line) => KHMER.test(line.text.km))).toEqual([]);
    expect(offending((line) => !KHMER.test(line.text.en))).toEqual([]);
  });

  it(`fits a dialogue box: ${LONGEST_LINE} English characters at most`, () => {
    expect(offending((line) => line.text.en.length <= LONGEST_LINE)).toEqual([]);
  });

  it('keeps Sochetra on the left, where the player stands', () => {
    expect(offending((line) => line.speaker !== 'sochetra' || line.side === 'left')).toEqual([]);
  });

  it("sets a villager's age, so a reporter is never drawn as a child", () => {
    expect(offending((line) => line.speaker !== 'villager' || AGES.includes(line.age))).toEqual([]);
  });

  it('names a villager who speaks twice in a scene, so they keep one face', () => {
    for (const { id, scene } of scenes) {
      const unnamed = scene.lines.filter((line) => line.speaker === 'villager' && !line.name);

      expect(unnamed.length, id).toBeLessThanOrEqual(1);
    }
  });
});

describe('the story', () => {
  it('opens in the mud and ends with a child in Chrey: "One day, it will be you."', () => {
    const [first] = CHAPTERS;
    const last = CHAPTERS.at(-1);
    const ending = last.stages.at(-1).scene;

    expect(englishOf(first, first.stages[0].scene).join(' ')).toMatch(/mud/);
    expect(last.scenes[ending].backdrop).toBe('village-dawn');
    expect(englishOf(last, ending)).toContain('Keep training. Every day. One day, it will be you.');
  });

  it('greets the dawn at Angkor before the last scene, and closes on the moral', () => {
    const last = CHAPTERS.at(-1);
    const [angkor] = last.stages.slice(-2).map((stage) => stage.scene);

    expect(last.scenes[angkor].backdrop).toBe('angkor-sunrise');
    expect(CLOSING_CARD.moral.map((line) => line.en).join(' ')).toMatch(
      /We have good players\. And one day, we will lift a trophy for our country\./,
    );
  });

  it('gives every rival lines of their own', () => {
    const rivals = Object.values(CHARACTERS).filter((character) => character.role === 'rival');

    for (const rival of rivals) {
      const speaks = lines.some(({ line }) => line.speaker === rival.id);

      expect(speaks, rival.id).toBe(true);
    }
  });
});
