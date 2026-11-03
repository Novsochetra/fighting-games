import { createCamera, updateCamera } from '../../render/camera.js';
import { createEffects, updateEffects } from '../../render/effects/index.js';
import { prepareSaveCam } from '../../render/save-cam/index.js';
import { drainEvents } from '../../sim/events.js';
import { tick } from '../../sim/tick.js';
import { createEdges, pressedOf } from './input-edges.js';
import { createLedger, recordEvents, resultOf } from './match-ledger.js';
import { createMoments, hearMoments, nextMomentScene } from './match-moments.js';
import { penaltiesWon, startPenalties, stepMatchShows, stepPenaltyShow } from './match-shows.js';
import { maybeStartReplay, stepIntro, stepReplayTv, watchTv } from './match-tv.js';
import {
  createSceneSession,
  isSceneSessionDone,
  stepSceneSession,
  tapSceneSession,
} from './scene-session.js';

// full time stays on screen a moment before the match hands back
const END_HOLD_TICKS = 120;

// `sceneOf(id)` finds a story scene the match's triggers name; a quick match has none. The save
// cam's view of the venue is painted now, while a card is up, so its first show never stalls
export function createMatchSession({ match, venue, triggers, sceneOf, heroAge, lang, knockout }) {
  prepareSaveCam(venue);

  return {
    match,
    venue,
    lang,
    heroAge,
    knockout: Boolean(knockout),
    sceneOf: sceneOf ?? (() => null),
    camera: createCamera(match),
    effects: createEffects(),
    ledger: createLedger(match.humanTeam),
    moments: createMoments(triggers),
    edges: createEdges(),
    overlay: null,
    duelShow: null,
    saveCamShow: null,
    shootout: null,
    penaltyShow: null,
    tap: null,
    tv: null,
    done: false,
  };
}

function openMoment(session) {
  const scene = session.sceneOf(nextMomentScene(session.moments));

  return scene
    ? createSceneSession(scene, { lang: session.lang, heroAge: session.heroAge, overlay: true })
    : null;
}

function checkEnd(session) {
  const { match } = session;

  if (match.phase !== 'over' || match.phaseTicks < END_HOLD_TICKS || session.overlay) {
    return;
  }

  if (session.knockout && match.score[0] === match.score[1]) {
    startPenalties(session);
  } else {
    session.done = true;
  }
}

function stepPlay(session, pressed, hear) {
  const { match } = session;

  stepMatchShows(session, { pressed, tap: session.tap });
  tick(match);
  updateCamera(session.camera, match);
  updateEffects(session.effects, match, { camera: session.camera });

  if (session.tv) {
    watchTv(session);
  }

  const events = drainEvents(match);

  recordEvents(session.ledger, match, events);
  hearMoments(session.moments, { match, ledger: session.ledger, events });
  hear?.(events, match);
  session.overlay = openMoment(session);

  if (session.tv) {
    maybeStartReplay(session);
  }

  checkEnd(session);
}

function stepOverlay(session, input) {
  stepSceneSession(session.overlay, input);

  if (isSceneSessionDone(session.overlay)) {
    session.overlay = openMoment(session);
  }
}

// what holds the match still this tick: a shootout replaces it; a story scene, the opening card
// and a goal's replay each pause it
function stepperOf(session) {
  if (session.penaltyShow) {
    return (pressed) => stepPenaltyShow(session, { pressed, tap: session.tap });
  }

  if (session.overlay) {
    return (_, input) => stepOverlay(session, input);
  }

  if (session.tv?.intro) {
    return (pressed) => stepIntro(session, pressed);
  }

  return session.tv?.replay ? (pressed) => stepReplayTv(session, pressed) : null;
}

export function stepMatchSession(session, input, { hear } = {}) {
  if (session.done) {
    return;
  }

  const pressed = pressedOf(session.edges, input);
  const pressedOrTapped = { ...pressed, pass: pressed.pass || Boolean(session.tap) };
  const stepper = stepperOf(session);

  if (stepper) {
    stepper(pressedOrTapped, input);
  } else {
    stepPlay(session, pressed, hear);
  }

  session.tap = null;
}

export function tapMatchSession(session, point) {
  if (session.overlay) {
    tapSceneSession(session.overlay, point);
  } else {
    session.tap = point;
  }
}

export const isMatchSessionDone = (session) => session.done;

export const matchSessionResult = (session) =>
  resultOf(session.ledger, { penalties: penaltiesWon(session) });
