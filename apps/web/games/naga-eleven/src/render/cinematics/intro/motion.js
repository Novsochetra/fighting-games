import { easeIn, easeOut, shareOf } from '../shared/ease.js';
import { INTRO_MOTION } from './timeline.js';

export function motionOf(state, start, delay = 0) {
  const from = start + delay;
  const enter = easeOut(shareOf(state.tick, from, INTRO_MOTION.slideIn));
  const leave = easeIn(shareOf(state.tick, state.beats.out + delay / 2, INTRO_MOTION.slideOut));

  return { enter, leave, shown: state.tick >= from && leave < 1 };
}
