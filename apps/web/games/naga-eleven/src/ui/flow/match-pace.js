import { CINEMA } from '../../data/cinema.js';
import { affords, countTick } from '../../render/cinema/budget.js';
import { addsTime, movesCamera } from '../../render/cinema/mode.js';

// The cinematic camera in open play (README "The cinematic camera"): a skill punches the camera in
// on its player and, where the player's camera adds time and the match can spare it, plays its
// first moments at half speed. The sim is never slowed itself: the session steps it on every
// other frame, so a match plays the same ticks however it is watched
export const createPace = () => ({ punchIn: null, lastAt: null, half: null, inHalf: 0 });

const { punchIn: RULES } = CINEMA;

function rested(pace, match) {
  if (pace.half !== match.half) {
    pace.half = match.half;
    pace.inHalf = 0;
  }

  const gapOver = pace.lastAt === null || match.tick - pace.lastAt >= RULES.gapTicks;

  return gapOver && pace.inHalf < RULES.mostPerHalf;
}

export function hearSkills(session, events) {
  const { pace, match } = session;
  const skill = events.find((event) => event.type === 'skill');

  if (!skill || !movesCamera(session.cinema) || pace.punchIn || !rested(pace, match)) {
    return;
  }

  const slow = addsTime(session.cinema) && affords(session.budget, RULES.slowTicks / 2);

  pace.punchIn = { player: skill.player, frames: 0, slow: slow ? RULES.slowTicks : 0 };
  pace.lastAt = match.tick;
  pace.inHalf += 1;
}

export function stepPace(session) {
  const { pace, match } = session;
  const punch = pace.punchIn;

  if (!punch) {
    return true;
  }

  punch.frames += 1;

  if (punch.frames > RULES.ticks || match.phase !== 'play') {
    pace.punchIn = null;

    return true;
  }

  return punch.frames > punch.slow || punch.frames % 2 === 0;
}

// a frame slow motion holds is a frame of show, counted against the match's budget
export function holdsFrame(session) {
  if (stepPace(session)) {
    return false;
  }

  countTick(session.budget, { showing: true });

  return true;
}

export const countFrame = (session) =>
  countTick(session.budget, { showing: Boolean(session.duelShow || session.saveCamShow) });
