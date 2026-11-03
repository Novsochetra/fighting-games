import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { VIEW } from '../../../src/config.js';
import { setBackdropCanvasFactory } from '../../../src/render/backdrops/index.js';
import { drawScene, setDialogueCanvasFactory } from '../../../src/render/dialogue/index.js';
import { SKIP_TAG } from '../../../src/render/dialogue/layout.js';
import { createInput } from '../../../src/sim/input-state.js';
import { createScene } from '../../../src/story/index.js';
import {
  createSceneSession,
  isSceneSessionDone,
  stepSceneSession,
  tapSceneSession,
} from '../../../src/ui/flow/scene-session.js';
import { createPixelCanvas } from '../../support/pixel-canvas.js';
import { SHORT_SCENE } from '../../support/story-fixtures.js';

// The story's SKIP tag was 76 x 22 canvas pixels, hard to hit with a thumb; one tap on it ended
// the whole scene with no second chance, and its see-through plate vanished on the spotlights of
// the trophy stage and the training ground

const middleOf = (rect) => ({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });

function sceneOn(backdrop) {
  const session = createSceneSession(
    { ...SHORT_SCENE, backdrop },
    { lang: 'en', heroAge: 'child' },
  );

  stepSceneSession(session, createInput());

  return session;
}

function tapTag(session, point = middleOf(SKIP_TAG)) {
  tapSceneSession(session, point);
  stepSceneSession(session, createInput());
}

const stepFor = (session, ticks) => {
  for (let i = 0; i < ticks; i += 1) {
    stepSceneSession(session, createInput());
  }
};

const lightAt = (canvas, { x, y }) => {
  const at = (y * canvas.width + x) * 4;
  const [red, green, blue] = canvas.data.subarray(at, at + 3);

  return 0.3 * red + 0.59 * green + 0.11 * blue;
};

describe('the story’s skip tag', () => {
  beforeEach(() => {
    setBackdropCanvasFactory(null);
    setDialogueCanvasFactory(null);
  });
  afterEach(() => setBackdropCanvasFactory(null));

  it('asks once before a tap skips the scene', () => {
    const session = sceneOn('black');

    tapTag(session);
    expect(isSceneSessionDone(session)).toBe(false);

    tapTag(session);
    expect(isSceneSessionDone(session)).toBe(true);
  });

  it('stops asking after a couple of seconds', () => {
    const session = sceneOn('black');

    tapTag(session);
    stepFor(session, 150);
    tapTag(session);

    expect(isSceneSessionDone(session)).toBe(false);
  });

  it('takes a thumb’s tap that lands just beside it', () => {
    const session = sceneOn('black');
    const beside = { x: SKIP_TAG.x - 10, y: SKIP_TAG.y + SKIP_TAG.height + 10 };

    tapTag(session, beside);
    tapTag(session, beside);

    expect(isSceneSessionDone(session)).toBe(true);
  });

  it('sits on a dark plate over the brightest backdrops', () => {
    for (const backdrop of ['trophy-stage', 'training-ground']) {
      const canvas = createPixelCanvas(VIEW.width, VIEW.height);
      const state = createScene({ ...SHORT_SCENE, backdrop });

      for (let i = 0; i < 60; i += 1) {
        state.tick += 1;
      }

      drawScene(canvas.getContext('2d'), state, { tick: 0 });

      // the plate's lower left, under the label and clear of its border
      const plate = { x: SKIP_TAG.x + 4, y: SKIP_TAG.y + SKIP_TAG.height - 6 };

      expect(lightAt(canvas, plate), backdrop).toBeLessThan(40);
    }
  });
});
