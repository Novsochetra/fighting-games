import { BANNER, HIGH_BANNER } from './layout.js';

// a scorer whose feet were under this row of the world's view as the ball went in would run
// about under the lower band: the GOAL band crosses high for him
const LOW_FEET = 480;

// the top of the big banner, in the view's pixels; `camera` is the live camera (src/render/camera.js)
export function bannerTopFor(camera, match) {
  const isLowScorer = match.phase === 'goal' && (camera?.scorerRow ?? 0) > LOW_FEET;

  return isLowScorer ? HIGH_BANNER.y : BANNER.y;
}
