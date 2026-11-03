import { drawDialogueOverlay, drawScene, hitTest } from '../../render/dialogue/index.js';
import { isHeld } from '../../sim/input-state.js';
import { askSkip, createScene, isSceneDone, updateScene } from '../../story/index.js';

// a story scene on its own screen, or `overlay` over a live match
export const createSceneSession = (scene, { lang, heroAge, overlay = false }) => ({
  state: createScene(scene, { lang, heroAge }),
  lang,
  overlay,
  tapped: null,
});

export function tapSceneSession(session, point) {
  session.tapped = hitTest(session.state, point, { overlay: session.overlay });
}

// the scene presses on as pass goes down (it tells a fresh press from a held one) and ends
// while shoot is held, as on a pad's B, or on a second tap of its skip tag
export function stepSceneSession(session, input) {
  if (session.tapped === 'skip') {
    askSkip(session.state);
  }

  updateScene(session.state, {
    confirm: isHeld(input, 'pass') || session.tapped === 'confirm',
    skip: isHeld(input, 'shoot'),
  });
  session.tapped = null;
}

export const isSceneSessionDone = (session) => isSceneDone(session.state);

export function drawSceneSession(context, session, { tick, characters }) {
  const draw = session.overlay ? drawDialogueOverlay : drawScene;

  draw(context, session.state, { lang: session.lang, tick, characters });
}
