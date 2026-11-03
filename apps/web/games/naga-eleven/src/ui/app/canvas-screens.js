import { CHARACTERS } from '../../data/characters.js';
import { drillKeys } from '../../render/training/index.js';
import { currentLine } from '../../story/index.js';
import { drawMatchSession } from '../flow/match-draw.js';
import {
  isMatchSessionDone,
  matchSessionResult,
  stepMatchSession,
  tapMatchSession,
} from '../flow/match-session.js';
import {
  drawSceneSession,
  isSceneSessionDone,
  stepSceneSession,
  tapSceneSession,
} from '../flow/scene-session.js';
import {
  drawTrainingSession,
  isTrainingSessionDone,
  stepTrainingSession,
  tapTrainingSession,
  trainingResultOf,
} from '../flow/training-session.js';

// Each canvas screen answers the same few calls, so the app runs whichever is up: `step(input,
// app)` once a tick, `draw(context, tick, app)` each frame, `tap(point)`, `isDone()` and
// `result()` once it is done. `playing` says whether the touch controls belong on it.

const shownOf = (session) => currentLine(session.state)?.shown?.length ?? 0;

// a soft blip every other letter the typewriter puts down, in the speaker's voice
function stepWithBlips(session, input, app) {
  const before = shownOf(session);

  stepSceneSession(session, input);

  const line = currentLine(session.state);
  const after = line?.shown?.length ?? 0;

  if (after > before && after % 2 === 0) {
    app.sound?.('blip', { speaker: line.speaker, age: line.portrait?.age });
  }
}

export const sceneScreen = (session, { mood } = {}) => ({
  kind: 'scene',
  mood,
  playing: false,
  step: (input, app) => stepWithBlips(session, input, app),
  draw: (context, tick) => drawSceneSession(context, session, { tick, characters: CHARACTERS }),
  tap: (point) => tapSceneSession(session, point),
  isDone: () => isSceneSessionDone(session),
  result: () => undefined,
});

// the touch pad shows only while the drill is run; its cards take taps on their own buttons
const DRILL_RUNNING = new Set(['ready', 'play', 'finish']);

// a duel's menu, a scene, television's cards and a shootout are tapped, so the pad stands aside
const isMatchRunning = (session) =>
  !session.done &&
  !session.overlay &&
  !session.duelShow &&
  !session.penaltyShow &&
  !session.tv?.intro &&
  !session.tv?.replay;

export const trainingScreen = (session) => ({
  kind: 'training',
  get playing() {
    return DRILL_RUNNING.has(session.state.phase);
  },
  // the touch keys this drill reads; the pad hides the rest, which would cover its targets
  get keys() {
    return drillKeys(session.state);
  },
  step: (input, app) => {
    stepTrainingSession(session, input);
    app.audio?.hearTraining(session.state);
  },
  draw: (context, tick, app) => drawTrainingSession(context, session, { tick, actors: app.actors }),
  tap: (point) => tapTrainingSession(session, point),
  isDone: () => isTrainingSessionDone(session),
  result: () => trainingResultOf(session),
});

export const matchScreen = (session) => ({
  kind: 'match',
  get playing() {
    return isMatchRunning(session);
  },
  session,
  venue: session.venue,
  step: (input, app) => stepMatchSession(session, input, { hear: app.hear }),
  draw: (context, tick, app) => drawMatchSession(context, session, { tick, actors: app.actors }),
  tap: (point) => tapMatchSession(session, point),
  isDone: () => isMatchSessionDone(session),
  result: () => matchSessionResult(session),
});

// a match shown still behind its line-up or its result card
export const stillScreen = (session) => ({
  ...matchScreen(session),
  kind: 'still',
  playing: false,
  step: () => {},
  draw: (context, tick, app) =>
    drawMatchSession(context, session, { tick, actors: app.actors, still: true }),
  isDone: () => false,
});

// what the canvas shows behind the title and the menus
export const paintedScreen = (paint) => ({
  kind: 'painted',
  playing: false,
  step: () => {},
  draw: (context, tick) => paint(context, { tick }),
  tap: () => {},
  isDone: () => false,
  result: () => undefined,
});

export { chapterCardScreen, closingCardScreen } from './card-screens.js';
