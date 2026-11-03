import { describe, expect, it } from 'vitest';
import {
  createScene,
  currentLine,
  isSceneDone,
  skipProgress,
  updateScene,
} from '../../../src/story/index.js';
import { LEGEND_SCENE, VILLAGE_SCENE, idle, press } from '../../support/story-fixtures.js';

// a reader who waits for each line to finish typing, then presses on
function readThrough(state, most = 5000) {
  const seen = [];

  for (let tick = 0; tick < most && !isSceneDone(state); tick += 1) {
    const line = currentLine(state);
    const confirm = line.typed && tick % 2 === 0;

    if (confirm && seen.at(-1) !== line.index) {
      seen.push(line.index);
    }

    updateScene(state, { confirm });
  }

  return seen;
}

describe('playing a scene through', () => {
  it('shows every line, fully typed, in order, then ends', () => {
    const state = createScene(LEGEND_SCENE, { heroAge: 'child' });

    expect(readThrough(state)).toEqual([0, 1, 2, 3]);
    expect(isSceneDone(state)).toBe(true);
  });

  it('takes longer to read a long line than a short one', () => {
    const long = createScene(LEGEND_SCENE);
    const short = createScene(LEGEND_SCENE);

    press(long);
    press(long);
    press(short);
    press(short);
    press(short);
    press(short);

    const ticksToType = (state) => {
      let ticks = 0;

      while (!currentLine(state).typed) {
        updateScene(state, {});
        ticks += 1;
      }

      return ticks;
    };

    expect(currentLine(long).index).toBe(1);
    expect(currentLine(short).index).toBe(2);
    expect(ticksToType(long)).toBeGreaterThan(ticksToType(short) * 4);
  });

  it('can be rushed through with a press for each line and its finish', () => {
    const state = createScene(VILLAGE_SCENE, { heroAge: 'teen' });
    const speakers = [];

    for (let i = 0; i < 20 && !isSceneDone(state); i += 1) {
      speakers.push(currentLine(state).speaker);
      press(state, { gap: 1 });
    }

    expect([...new Set(speakers)]).toEqual(['villager', 'dara', 'rithy']);
    expect(isSceneDone(state)).toBe(true);
  });

  it('draws the friends at the chapter’s age all the way through', () => {
    const state = createScene(VILLAGE_SCENE, { heroAge: 'teen' });
    const ages = new Map();

    while (!isSceneDone(state)) {
      const { portrait } = currentLine(state);

      ages.set(portrait.character, portrait.age);
      press(state, { gap: 1 });
    }

    expect(Object.fromEntries(ages)).toMatchObject({ dara: 'teen', rithy: 'teen' });
  });

  it('is skipped by holding skip, part way through a line', () => {
    const state = createScene(LEGEND_SCENE);

    idle(state, 10);

    for (let tick = 0; !isSceneDone(state) && tick < 100; tick += 1) {
      updateScene(state, { skip: true });
    }

    expect(isSceneDone(state)).toBe(true);
    expect(skipProgress(state)).toBe(1);
  });
});
