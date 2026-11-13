// What the cinematic camera may add to a match (README "The cinematic camera"). The shows of a
// match (cut-ins, chases, save cams, slow motion) take no more than `budget.share` of its real
// time; a beat that adds time plays only while it fits, counted from `budget.headStart` ticks of
// play so the first duel of a match has room
export const CINEMA = {
  budget: { share: 0.2, headStart: 2400 },
  // the ball rides across the screen between the cut-ins and the save cam; a press after
  // `skipAfter` goes on
  chase: { ticks: 40, skipAfter: 18 },
  // the clash holds still on the impact
  clashFreeze: 6,
  // in open play a skill zooms the camera in on its player for `ticks`, the first `slowTicks` at
  // half speed; no sooner than `gapTicks` after the last, nor more than `mostPerHalf` a half
  punchIn: { ticks: 30, slowTicks: 20, gapTicks: 600, mostPerHalf: 6 },
};
