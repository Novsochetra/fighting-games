// The save cam (README "Keeper skills and the save cam") shows a shot meeting the keeper from in
// front of the goal. Every keeper round of a duel plays it; in open play only a shot a skill acts
// in, or a great save, does, so the match does not stop for every shot
export const SAVE_CAM = {
  // in open play: a shot on target struck with a skill or special, or lifted by a pass combo from
  // `fromLevel`, or one the keeper's save skill answers, or a save at this share of his reach
  fromLevel: 3,
  stretchShare: 0.9,
  // no sooner than this after the last one, and no more than this many a half
  gapTicks: 1200,
  mostPerHalf: 2,
  // the show ends it (or a press skips it); an unwatched match never stops for it, and a watched
  // one plays on after this in case nothing ends it
  timeout: 240,
};
