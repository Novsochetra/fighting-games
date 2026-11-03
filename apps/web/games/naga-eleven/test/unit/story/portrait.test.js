import { describe, expect, it } from 'vitest';
import { VILLAGER_COUNT } from '../../../src/render/portraits/cast/index.js';
import { isNarration, portraitFor, stableHash } from '../../../src/story/portrait.js';
import { createScene, currentLine } from '../../../src/story/scene.js';
import { villagerFaces } from '../../../src/story/villagers.js';
import { VILLAGE_SCENE } from '../../support/story-fixtures.js';

describe('the portrait of a line', () => {
  it('draws the hero, Dara and Rithy at the chapter’s age', () => {
    for (const speaker of ['sochetra', 'dara', 'rithy']) {
      expect(portraitFor({ speaker, mood: 'happy' }, 'teen')).toEqual({
        character: speaker,
        age: 'teen',
        mood: 'happy',
      });
    }
  });

  it('draws everyone else at the age the cast gives them, neutral unless told', () => {
    expect(portraitFor({ speaker: 'ta-sok' }, 'child')).toEqual({
      character: 'ta-sok',
      age: 'adult',
      mood: 'neutral',
    });
    expect(portraitFor({ speaker: 'haruto', mood: 'smirk' }, 'child')).toMatchObject({
      age: 'young',
    });
    expect(portraitFor({ speaker: 'someone-new' }, 'child').age).toBeNull();
  });

  it('has none for the narrator, or for a line nobody says', () => {
    expect(portraitFor({ speaker: 'narrator', text: 'Dawn.' }, 'child')).toBeNull();
    expect(portraitFor({ text: 'Dawn.' }, 'child')).toBeNull();
    expect(isNarration({ speaker: 'narrator' })).toBe(true);
    expect(isNarration({ speaker: 'dara' })).toBe(false);
  });

  it('gives villagers varied faces that stay the same each time', () => {
    const faces = VILLAGE_SCENE.lines
      .filter((line) => line.speaker === 'villager')
      .map((line) => portraitFor(line, 'child').variant);

    expect(faces[0]).not.toBe(faces[1]);
    expect(portraitFor(VILLAGE_SCENE.lines[0], 'child').variant).toBe(faces[0]);

    for (const face of faces) {
      expect(face).toBeGreaterThanOrEqual(0);
      expect(face).toBeLessThan(VILLAGER_COUNT);
    }
  });

  it('gives each villager of a scene a face of their own, the same in every language', () => {
    const faces = villagerFaces(VILLAGE_SCENE.lines);

    expect([...faces.keys()]).toEqual(['Fisherman', 'He kicks like a buffalo!']);
    expect(new Set(faces.values()).size).toBe(2);
  });

  it('keeps a villager’s face whatever the language', () => {
    const english = currentLine(createScene(VILLAGE_SCENE, { lang: 'en' }));
    const khmer = currentLine(createScene(VILLAGE_SCENE, { lang: 'km' }));

    expect(khmer.portrait).toEqual(english.portrait);
  });

  it('gives villagers an age the cast allows them, unless the line picks one', () => {
    const ages = VILLAGE_SCENE.lines
      .filter((line) => line.speaker === 'villager')
      .map((line) => portraitFor(line, 'teen').age);

    expect(ages.every((age) => ['child', 'adult'].includes(age))).toBe(true);
    expect(portraitFor({ speaker: 'villager', age: 'elder', text: 'Hi' }, 'child').age).toBe(
      'elder',
    );
  });

  it('draws a teen villager as a young one, the nearest face there is', () => {
    expect(portraitFor({ speaker: 'villager', age: 'teen', text: 'Hi' }, 'child').age).toBe(
      'young',
    );
  });

  it('lets a line pick a villager’s face', () => {
    expect(portraitFor({ speaker: 'villager', face: 3, text: 'Hi' }, 'child').variant).toBe(3);
  });

  it('hashes a text the same way every time', () => {
    expect(stableHash('Look at the boy run!')).toBe(stableHash('Look at the boy run!'));
    expect(stableHash('a')).not.toBe(stableHash('b'));
  });
});
