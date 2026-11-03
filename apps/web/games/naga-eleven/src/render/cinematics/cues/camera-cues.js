import * as CAMERA from '../../camera.js';

// TV moves made only of the camera's own panCamera and shakeCamera, a call each tick from
// stepCue before updateCamera; with no such camera they are null and do nothing
const SWEEP = { hold: 20, ticks: 150 };
const CELEBRATION = { ticks: 120, ease: 0.1, shake: 5 };

const canPan = (api) => typeof api?.panCamera === 'function';

const centreOf = (match) => ({ x: match.pitch.length / 2, y: match.pitch.width / 2 });

// a slow pan from one goal (`fromEnd` 0 is team 0's, 1 the other) to the centre spot: the camera
// cuts to the goal, holds there a moment, then glides in
export function kickoffSweep(camera, match, { fromEnd = 0, api = CAMERA } = {}) {
  if (!camera || !canPan(api)) {
    return null;
  }

  const centre = centreOf(match);

  return {
    kind: 'sweep',
    age: 0,
    length: SWEEP.hold + SWEEP.ticks,
    api,
    from: { x: fromEnd * match.pitch.length, y: centre.y },
    to: centre,
  };
}

// held at the goal a pan of one tick at a time, so the camera does not drift back to the ball
function stepSweep(cue, camera) {
  if (cue.age < SWEEP.hold) {
    cue.api.panCamera(camera, { ...cue.from, ticks: 1 });
  } else if (cue.age === SWEEP.hold) {
    cue.api.panCamera(camera, { ...cue.to, ticks: SWEEP.ticks });
  }
}

const playerOf = (match, scorer) =>
  typeof scorer === 'number' ? match.players[scorer] : (scorer ?? null);

// the camera stays on the scorer for two seconds as they run off to celebrate, with a jolt as
// the ball hits the net; `scorer` is a player or a player's index
export function goalCelebration(camera, match, scorer, { api = CAMERA } = {}) {
  const player = playerOf(match, scorer);

  if (!camera || !player || !canPan(api)) {
    return null;
  }

  api.shakeCamera?.(camera, CELEBRATION.shake);

  return {
    kind: 'celebration',
    age: 0,
    length: CELEBRATION.ticks,
    api,
    scorer: player.index,
    focus: { x: player.x, y: player.y },
  };
}

function stepCelebration(cue, camera, match) {
  const player = match.players[cue.scorer];

  if (!player) {
    return;
  }

  cue.focus.x += (player.x - cue.focus.x) * CELEBRATION.ease;
  cue.focus.y += (player.y - cue.focus.y) * CELEBRATION.ease;
  cue.api.panCamera(camera, { ...cue.focus, ticks: 1 });
}

const STEPS = { sweep: stepSweep, celebration: stepCelebration };

export const isCueDone = (cue) => !cue || cue.age >= cue.length;

// once a tick, before updateCamera; returns whether the cue is still running
export function stepCue(cue, camera, match) {
  if (isCueDone(cue) || !camera) {
    return false;
  }

  STEPS[cue.kind](cue, camera, match);
  cue.age += 1;

  return !isCueDone(cue);
}
