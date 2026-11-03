import { describe, expect, it } from 'vitest';
import { compileTheme } from '../../../../src/audio/music/compile.js';
import { themeProblems } from '../../../../src/audio/music/theme-problems.js';
import { INSTRUMENTS } from '../../../../src/data/music/band.js';
import { SCENE_MOODS, THEME_IDS, THEMES } from '../../../../src/data/music/index.js';

const MOODS = ['title', 'match', 'training', 'victory', 'defeat'];

describe('the themes', () => {
  it.each(THEME_IDS)('%s has every note in range and in its scale, and every bar full', (id) => {
    expect(themeProblems(THEMES[id])).toEqual([]);
  });

  it('play a theme for every scene mood of the story and every mood of the game', () => {
    expect(THEME_IDS).toEqual(expect.arrayContaining([...SCENE_MOODS, ...MOODS]));
  });

  it('loop, but for the victory jingle and the defeat sting, which play once', () => {
    for (const id of THEME_IDS) {
      expect(THEMES[id].loop, id).toBe(!['victory', 'defeat'].includes(id));
    }
  });

  it('keep the jingles short', () => {
    for (const id of ['victory', 'defeat']) {
      const { totalSteps, stepSeconds } = compileTheme(THEMES[id]);

      expect(totalSteps * stepSeconds, id).toBeLessThan(8);
    }
  });

  it('give the roneat the lead of each looping theme but the sad one, where the tro sings', () => {
    for (const id of THEME_IDS.filter((each) => THEMES[each].loop)) {
      expect(Object.keys(THEMES[id].tracks), id).toContain(id === 'sad' ? 'tro' : 'roneat');
    }
  });

  it('roll and double the roneat somewhere in the heroic themes, as a pinpeat player does', () => {
    for (const id of ['title', 'triumph', 'victory']) {
      const notes = compileTheme(THEMES[id])
        .steps.flat()
        .filter((note) => note.instrument === 'roneat');

      expect(
        notes.some((note) => note.roll),
        id,
      ).toBe(true);
      expect(
        notes.some((note) => note.octave),
        id,
      ).toBe(true);
    }
  });

  it('beat the chhing in every theme with drums, under the match theme too', () => {
    for (const id of ['title', 'hope', 'tense', 'triumph', 'match', 'training']) {
      expect(Object.keys(THEMES[id].tracks), id).toEqual(
        expect.arrayContaining(['skor', 'chhing']),
      );
    }
  });

  it('write each theme only for the band it has', () => {
    for (const theme of Object.values(THEMES)) {
      for (const name of Object.keys(theme.tracks)) {
        expect(INSTRUMENTS[name], `${theme.id} ${name}`).toBeDefined();
      }
    }
  });
});
