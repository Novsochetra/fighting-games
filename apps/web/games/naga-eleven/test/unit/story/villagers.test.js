import { describe, expect, it } from 'vitest';
import { VILLAGER_KINDS } from '../../../src/render/portraits/cast/index.js';
import {
  VILLAGER_AGES,
  pickVillagerFace,
  villagerAge,
  villagerFaces,
} from '../../../src/story/villagers.js';

const villager = (en, fields = {}) => ({
  speaker: 'villager',
  name: { en, km: en },
  text: { en: 'Hello!', km: 'Hello!' },
  ...fields,
});

const kindOf = (face) => VILLAGER_KINDS[face];

describe('a villager’s face', () => {
  it('has a boy and a girl, a man and a woman of every age', () => {
    for (const age of VILLAGER_AGES) {
      for (const sex of ['male', 'female']) {
        expect(VILLAGER_KINDS).toContainEqual({ age, sex });
      }
    }
  });

  it('fits the line’s age, and its sex when the line says', () => {
    for (const age of VILLAGER_AGES) {
      for (const sex of ['male', 'female']) {
        expect(kindOf(pickVillagerFace(villager('Someone', { age, sex })))).toEqual({ age, sex });
      }
    }

    expect(kindOf(pickVillagerFace(villager('Grandma', { age: 'elder' }))).age).toBe('elder');
  });

  it('draws a teen as a young villager', () => {
    expect(villagerAge(villager('Student', { age: 'teen' }))).toBe('young');
    expect(kindOf(pickVillagerFace(villager('Student', { age: 'teen' }))).age).toBe('young');
  });

  it('keeps the face a line picks', () => {
    expect(pickVillagerFace(villager('Monk', { age: 'child', face: 6 }))).toBe(6);
  });

  it('lends a crowd of one age the nearest age’s faces once its own are taken', () => {
    const kids = ['Vibol', 'Sreypov', 'Kosal'].map((en) => villager(en, { age: 'child' }));
    const faces = [...villagerFaces(kids).values()];

    expect(new Set(faces).size).toBe(3);
    expect(faces.map((face) => kindOf(face).age).sort()).toEqual(['child', 'child', 'young']);
  });

  it('gives a villager who speaks twice the same face both times', () => {
    const lines = [villager('Neighbour'), villager('Fan'), villager('Neighbour')];

    expect(villagerFaces(lines).size).toBe(2);
  });
});
