import {
  countEvents,
  createIntro,
  createMatchStats,
  isIntroDone,
  updateIntro,
} from '../../render/cinematics/index.js';
import { updateCamera } from '../../render/camera.js';
import { createEffects, updateEffects } from '../../render/effects/index.js';
import {
  createRecorder,
  createReplay,
  isReplayDone,
  recordFrame,
  replayCamera,
  replayFrameMatch,
  stepReplay,
} from '../../render/replay/index.js';
import { textOf } from '../../render/text.js';
import { venueName } from '../screens/venue-names.js';

// the scorers celebrate a moment before the replay rolls
const REPLAY_AFTER_TICKS = 70;

// a match as television shows it: an opening card, a tape of the last seconds for a goal's replay,
// and the counts the half-time and full-time boards show
export function createTv(session, { cup = null, round = null, rival = null } = {}) {
  const [home, away] = session.specs;
  const venue = textOf(venueName(session.venue), session.lang);

  return {
    intro: createIntro({ home, away, cup, round, venueName: venue, rival, lang: session.lang }),
    recorder: createRecorder({ seconds: 5 }),
    stats: createMatchStats(),
    replay: null,
    replayEffects: null,
    replayed: 0,
  };
}

// while the opening card plays the match waits at its kick off, the camera sweeping in
export function stepIntro(session, pressed) {
  const { tv } = session;

  updateIntro(tv.intro, { pass: pressed.pass });
  updateCamera(session.camera, session.match);

  if (isIntroDone(tv.intro)) {
    tv.intro = null;
  }
}

// once a tick, before the match's events are drained
export function watchTv(session) {
  recordFrame(session.tv.recorder, session.match);
  countEvents(session.tv.stats, session.match.events, session.match);
}

export function maybeStartReplay(session) {
  const { tv, match } = session;
  const goals = match.score[0] + match.score[1];

  if (match.phase === 'goal' && match.phaseTicks >= REPLAY_AFTER_TICKS && tv.replayed < goals) {
    tv.replay = createReplay(tv.recorder, {});
    tv.replayEffects = createEffects();
    tv.replayed = goals;
  }
}

export function stepReplayTv(session, pressed) {
  const { tv } = session;

  stepReplay(tv.replay, { pass: pressed.pass });
  updateEffects(tv.replayEffects, replayFrameMatch(tv.replay), {
    camera: replayCamera(tv.replay),
  });

  if (isReplayDone(tv.replay)) {
    tv.replay = null;
  }
}
