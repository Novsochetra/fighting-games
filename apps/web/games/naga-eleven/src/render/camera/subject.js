import { cornerFocus } from './set-piece.js';

// a goal is first seen in the net, with its flash and banner, before the camera turns to the
// scorer, slowly, as they run off to celebrate
const SCORER = { afterTicks: 45, smooth: 40 };

// what the camera follows: the ball in play inside its window, a little ahead of the run; a
// moment (the ball in the net, the scorer, a corner) is `framed`, looked at straight on
export function subjectOf(camera, match) {
  const isCelebrating = match.phase === 'goal' && match.phaseTicks >= SCORER.afterTicks;
  const scorer = isCelebrating && match.players[camera.scorer ?? -1];
  const corner = cornerFocus(match);

  if (scorer) {
    return { point: scorer, lead: 0, smooth: SCORER.smooth, framed: true };
  }

  if (corner || match.phase === 'goal') {
    return { point: corner ?? match.ball, lead: 0, smooth: null, framed: true };
  }

  return { point: match.ball, lead: camera.lead.x, smooth: null, framed: false };
}
