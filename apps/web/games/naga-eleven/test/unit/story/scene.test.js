import { describe, expect, it } from 'vitest';
import {
  SKIP_TICKS,
  createScene,
  currentLine,
  endScene,
  isSceneDone,
  skipProgress,
  updateScene,
} from '../../../src/story/scene.js';
import { LEGEND_SCENE, SHORT_SCENE, idle, press } from '../../support/story-fixtures.js';

describe('a scene', () => {
  it('starts on its first line with nothing typed yet', () => {
    const state = createScene(SHORT_SCENE);

    expect(currentLine(state)).toMatchObject({
      speaker: 'coach-vannak',
      mood: 'neutral',
      side: 'left',
      text: 'Go.',
      shown: '',
      typed: false,
      index: 0,
      count: 2,
    });
    expect(isSceneDone(state)).toBe(false);
  });

  it('types its line a tick at a time', () => {
    const state = createScene(SHORT_SCENE);

    idle(state, 2);

    expect(currentLine(state).shown).toBe('Go.');
    expect(currentLine(state).typed).toBe(true);
  });

  it('shows the whole line at the first press, and goes on at the next', () => {
    const state = createScene(LEGEND_SCENE);

    idle(state, 1);
    press(state);
    expect(currentLine(state).index).toBe(0);
    expect(currentLine(state).typed).toBe(true);

    press(state);
    expect(currentLine(state).index).toBe(1);
    expect(currentLine(state).typed).toBe(false);
  });

  it('hears a press held down as one press', () => {
    const state = createScene(SHORT_SCENE);

    idle(state, 1);

    for (let i = 0; i < 20; i += 1) {
      updateScene(state, { confirm: true });
    }

    expect(currentLine(state).index).toBe(0);
  });

  it('lets go of a button already down when it came up', () => {
    const state = createScene(SHORT_SCENE);

    for (let i = 0; i < SKIP_TICKS * 2; i += 1) {
      updateScene(state, { confirm: true, skip: true });
    }

    expect(currentLine(state).index).toBe(0);

    expect(isSceneDone(state)).toBe(false);
  });

  it('ends once its last line is passed', () => {
    const state = createScene(SHORT_SCENE);

    idle(state, 3);
    expect(currentLine(state).typed).toBe(true);

    press(state);
    expect(currentLine(state).index).toBe(1);

    press(state);
    expect(currentLine(state)).toMatchObject({ index: 1, typed: true });

    press(state);
    expect(isSceneDone(state)).toBe(true);
    expect(currentLine(state)).toBeNull();
  });

  it('ends when skip is held about half a second, and not before', () => {
    const state = createScene(LEGEND_SCENE);

    updateScene(state, { skip: false });

    for (let i = 0; i < SKIP_TICKS - 1; i += 1) {
      updateScene(state, { skip: true });
    }

    expect(skipProgress(state)).toBeGreaterThan(0.9);
    expect(isSceneDone(state)).toBe(false);

    updateScene(state, { skip: false });
    expect(skipProgress(state)).toBe(0);

    for (let i = 0; i < SKIP_TICKS; i += 1) {
      updateScene(state, { skip: true });
    }

    expect(isSceneDone(state)).toBe(true);
  });

  it('ends at once when told to, as a tap on skip does', () => {
    const state = endScene(createScene(LEGEND_SCENE));

    expect(isSceneDone(state)).toBe(true);
    expect(updateScene(state, { confirm: true })).toBe(state);
  });

  it('is done from the start when it has no lines', () => {
    const state = createScene({ backdrop: 'black', lines: [] });

    expect(isSceneDone(state)).toBe(true);
    expect(currentLine(state)).toBeNull();
  });

  it('reads its lines in the language it was made in', () => {
    const state = createScene(LEGEND_SCENE, { lang: 'km' });

    expect(currentLine(state).text).toBe('ភូមិជ្រៃ ខេត្តកំពង់ចាម។ យប់មុនការប្រកួតដំបូង។');
  });

  it('keeps who stands on each side, the last to speak in front', () => {
    const state = createScene(LEGEND_SCENE);

    idle(state, 1);
    press(state);
    press(state);
    expect(state.stage).toMatchObject({ left: { speaker: 'ta-sok' }, right: null });

    const enteredAt = state.stage.left.since;

    press(state);
    press(state);
    expect(state.stage).toMatchObject({
      left: { speaker: 'ta-sok', since: enteredAt },
      right: { speaker: 'sochetra' },
      speaking: 'right',
    });

    press(state);
    press(state);
    expect(state.stage.speaking).toBe('left');
    expect(state.stage.left).toMatchObject({ since: enteredAt, portrait: { mood: 'neutral' } });
  });
});
