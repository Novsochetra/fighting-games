import { THOUSAND_CUTS } from '../../data/ultimates/thousand-cuts.js';
import { WEAPONS } from '../../data/weapons/index.js';

const { passesAt, passes, windTicks, crossTicks } = THOUSAND_CUTS;
// he cuts with the dav, whatever he holds: his strips' sword row
export const SWORD_ROW = WEAPONS.sword.spriteRow;
// the dav lowered at his side after the last cut, as he waits for the cuts to land
export const STILL_FRAME = ['slash1', 4, SWORD_ROW];

// each pass: when he starts winding up, when he crosses, when the cut lands (halfway across) and when
// the next pass takes over
export const PASSES = passes.reduce((list, { sprite, ticks }) => {
  const start = list.length ? list.at(-1).end : passesAt;
  const crossAt = start + windTicks;
  const cutAt = crossAt + crossTicks / 2;
  list.push({ sprite, start, crossAt, cutAt, end: start + ticks });
  return list;
}, []);

export const PASSES_END = PASSES.at(-1).end;

export function passAt(time) {
  return PASSES.findIndex(({ start, end }) => time >= start && time < end);
}

// winding up on the frame before the strike, crossing on the strike, holding the follow-through
export function passFrame(time) {
  const pass = PASSES[passAt(time)];
  if (!pass) {
    return STILL_FRAME;
  }
  const [strip, strike] = pass.sprite;
  if (time < pass.crossAt) {
    return [strip, strike - 1, SWORD_ROW];
  }
  return [strip, time < pass.crossAt + crossTicks ? strike : strike + 1, SWORD_ROW];
}
