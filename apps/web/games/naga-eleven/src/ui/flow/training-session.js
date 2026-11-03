import { drawDrill, hitTest } from '../../render/training/index.js';
import { isHeld, wasPressed } from '../../sim/input-state.js';
import { createDrill, drillResult, isDrillOver, updateDrill } from '../../training/index.js';

const ACTIONS = ['up', 'down', 'left', 'right', 'pass', 'shoot', 'sprint'];

export const createTrainingSession = (drill, { seed, level, lang }) => ({
  state: createDrill(drill, { seed, level }),
  lang,
  tapped: null,
});

export function tapTrainingSession(session, point) {
  session.tapped = hitTest(session.state, point);
}

// the drill reads the same held and pressed actions a match does; a tap on its card presses one
function snapshotOf(input, tapped) {
  const held = Object.fromEntries(ACTIONS.map((action) => [action, isHeld(input, action)]));
  const pressed = Object.fromEntries(ACTIONS.map((action) => [action, wasPressed(input, action)]));

  if (tapped) {
    pressed[tapped] = true;
  }

  return { held, pressed };
}

export function stepTrainingSession(session, input) {
  updateDrill(session.state, snapshotOf(input, session.tapped));
  session.tapped = null;
}

export const isTrainingSessionDone = (session) => isDrillOver(session.state);

export const trainingResultOf = (session) => drillResult(session.state);

export const drawTrainingSession = (context, session, { tick, actors }) =>
  drawDrill(context, session.state, { lang: session.lang, tick, actors });

export const trainingEventsOf = (session) => session.state.events ?? [];
