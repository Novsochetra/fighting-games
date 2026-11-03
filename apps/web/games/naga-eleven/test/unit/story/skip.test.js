import { describe, expect, it } from 'vitest';
import { askSkip, createScene, isSceneDone, isSkipAsked } from '../../../src/story/index.js';
import { SKIP_ASK_TICKS } from '../../../src/story/skip.js';
import { SHORT_SCENE, idle, press } from '../../support/story-fixtures.js';

describe('a tap on a scene’s skip tag', () => {
  it('asks first, and skips on a second tap while it asks', () => {
    const state = createScene(SHORT_SCENE);

    askSkip(state);
    expect(isSkipAsked(state)).toBe(true);
    expect(isSceneDone(state)).toBe(false);

    idle(state, SKIP_ASK_TICKS - 2);
    askSkip(state);
    expect(isSceneDone(state)).toBe(true);
  });

  it('stops asking after two seconds', () => {
    const state = createScene(SHORT_SCENE);

    askSkip(state);
    idle(state, SKIP_ASK_TICKS);

    expect(isSkipAsked(state)).toBe(false);
  });

  it('stops asking once the player goes on with the scene instead', () => {
    const state = createScene(SHORT_SCENE);

    askSkip(state);
    press(state);

    expect(isSkipAsked(state)).toBe(false);
    askSkip(state);
    expect(isSceneDone(state)).toBe(false);
  });
});
