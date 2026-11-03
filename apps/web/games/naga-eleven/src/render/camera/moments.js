import { PHASE_TICKS } from '../../data/tuning.js';
import { clampAlong, clampDepth } from './bounds.js';
import { FOCUS_ROW, rowAt } from './lens.js';
import { startPan } from './pan.js';

// a kickoff opens on a sweep from the far stand at one end of the ground down to the centre spot,
// so the venue is seen before the ball is; it comes to rest on the spot a moment before the
// whistle, so the kick off is played under a still view
export const SWEEP_TICKS = PHASE_TICKS.kickoff - 9;

export function sweepToCentre(camera, match, fromEnd) {
  const y = clampDepth(camera.bounds, match.pitch.width / 2);
  const far = camera.bounds.minY;
  const centre = clampAlong(camera.bounds, camera.lens, { x: match.pitch.length / 2, y });

  camera.depth.value = far;
  camera.along.value = clampAlong(camera.bounds, camera.lens, {
    x: fromEnd * match.pitch.length,
    y: far,
  });
  startPan(camera, { x: centre, y, ticks: SWEEP_TICKS, byKickoff: true });
  camera.pan.untilPlay = true;
}

// the sweep is for the wait before the whistle: once the ball is played the camera follows it from
// where the sweep has come to, at the speed it was gliding, so the kick off is never missed
function endSweepAtPlay(camera, match) {
  if (camera.pan?.untilPlay && match.phase === 'play') {
    camera.pan = null;
  }
}

function nearestOfTeam(match, team) {
  let nearest = null;
  let gap = Infinity;

  for (const player of match.players) {
    const distance = Math.abs(player.x - match.ball.x) + Math.abs(player.y - match.ball.y);

    if (player.team === team && distance < gap) {
      nearest = player.index;
      gap = distance;
    }
  }

  return nearest;
}

// the row of the view a player's feet were on, as the camera stood
const rowOnView = (camera, player) =>
  player ? FOCUS_ROW - rowAt(camera.lens, camera.depth.value) + rowAt(camera.lens, player.y) : null;

// the camera keeps who scored, read from the goal event or, when the events were drained before it
// looked, guessed as the scoring side's player nearest the ball, and where he stood in the view as
// it went in, for the GOAL band to keep clear of him
function noteScorer(camera, match) {
  const goal = (match.events ?? []).find((event) => event.type === 'goal');
  const team = [0, 1].find((side) => match.score[side] > camera.score[side]);
  const before = camera.scorer;

  if (goal && goal.scorer !== null && goal.scorer !== undefined) {
    camera.scorer = goal.scorer;
  } else if (team !== undefined && camera.scorer === null) {
    camera.scorer = nearestOfTeam(match, team);
  }

  if (camera.scorer !== before) {
    camera.scorerRow = rowOnView(camera, match.players[camera.scorer ?? -1]);
  }

  camera.score = [...match.score];
}

export function noteMoments(camera, match) {
  noteScorer(camera, match);
  endSweepAtPlay(camera, match);

  if (match.phase !== 'goal' && camera.phase === 'goal') {
    camera.scorer = null;
  }

  if (match.phase === 'kickoff' && camera.phase === 'halfTime') {
    sweepToCentre(camera, match, match.half === 2 ? 1 : 0);
  }

  camera.phase = match.phase;
}
