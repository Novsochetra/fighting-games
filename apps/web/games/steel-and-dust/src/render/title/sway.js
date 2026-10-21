import { shiftRows } from './shift-rows.js';

const RATE = 0.019;
const GUST_RATE = 0.047;

// how far a crown leans at a tick, from -1 to 1: a slow sway with a quicker gust over it, each
// crown on its own beat so they never move as one
export function swayAt(index, tick) {
  const phase = index * 2.3;
  return Math.sin(tick * RATE + phase) * 0.75 + Math.sin(tick * GUST_RATE + phase * 1.7) * 0.25;
}

// a crown bends from where it meets its trunk: its bottom row holds still and its top moves most
export function swayOffset(crown, y, lean) {
  const bend = (crown.bottom - y) / (crown.bottom - crown.top);
  return Math.round(lean * bend) || 0;
}

// the palm crowns against the sky lean in the evening breeze, a pixel or two at their tops
export function drawSway(painter, { effect, tick, painting }) {
  effect.crowns.forEach((crown, index) => {
    const lean = swayAt(index, tick) * effect.reach;
    const offsetAt = (y) => swayOffset(crown, y, lean);
    shiftRows(painter.context, { painting, area: crown, offsetAt });
  });
}
