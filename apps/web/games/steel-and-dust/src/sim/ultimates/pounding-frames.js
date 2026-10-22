import { POUNDING_LION } from '../../data/ultimates/pounding-lion.js';
import { COIL_FRAME } from './lion-gather.js';
import { FISTS_ROW, rushFrame, WAKE_AT } from './rush-timing.js';

const { poseTicks, slamAt, gatherAt, rushAt, pounceAt } = POUNDING_LION;
// [strip, frame] and the ticks it shows; the last is held. The Bokator salute: he stands, bows his head
// over his fists and steps back into his stance
const BOW = [
  [['win', 0], poseTicks],
  [['win', 1], poseTicks],
  [['win', 2], poseTicks],
  [['idle', 0], poseTicks],
];
// he leaps with his fist raised and drives it into the ground on the blow's tick
const SLAM = [
  [['cleave', 1], 6],
  [['cleave', 2], 6],
  [['cleave', 3], 1],
];
// a leap and both fists into the ground as the pride lands, crouched over the blow after
const FINALE = [
  [['plunge', 0], 6],
  [['plunge', 1], 6],
  [['plunge', 2], 14],
  [['plunge', 3], 1],
];
const ticksBefore = (frames, index) =>
  frames.slice(0, index).reduce((sum, [, ticks]) => sum + ticks, 0);
// the blow's frame (the third) lands on its tick
const SLAM_START = slamAt - ticksBefore(SLAM, 2);
export const FINALE_START = pounceAt - ticksBefore(FINALE, 2);
const STANCE_TICKS = 8;
const STANCE_FRAMES = 6;

function frameIn(frames, since) {
  let left = since;
  for (const [frame, ticks] of frames) {
    if (left < ticks) {
      return [...frame, FISTS_ROW];
    }
    left -= ticks;
  }
  return [...frames.at(-1)[0], FISTS_ROW];
}

// his frames, all from his bare-hand strips: the salute through the cut-in, the fist that slams the
// ground, the coil, the rush, his stance while the pride wakes, and the leaping blow as it pounces
export function poundingFrame(time) {
  if (time >= FINALE_START) {
    return frameIn(FINALE, time - FINALE_START);
  }
  if (time >= WAKE_AT) {
    return ['idle', Math.floor(time / STANCE_TICKS) % STANCE_FRAMES, FISTS_ROW];
  }
  if (time >= rushAt) {
    return rushFrame(time);
  }
  if (time >= gatherAt) {
    return COIL_FRAME;
  }
  if (time >= SLAM_START) {
    return frameIn(SLAM, time - SLAM_START);
  }
  return frameIn(BOW, time);
}
