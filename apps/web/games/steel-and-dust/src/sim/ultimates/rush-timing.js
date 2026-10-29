import { POUNDING_LION } from '../../data/ultimates/pounding-lion.js';
import { WEAPONS } from '../../data/weapons/index.js';
import { lastOf } from '../../lib/lists.js';

const { rushAt, rush, zipTicks, windTicks } = POUNDING_LION;
// he rushes bare-handed, whatever he holds: his strips' fists row
export const FISTS_ROW = WEAPONS.fists.spriteRow;
const ZIP_FRAME = ['dash', 2, FISTS_ROW];

// each blow of the rush: when its zip starts, when it strikes and when the next zip takes over
export const RUSH_BLOWS = rush.reduce((blows, { sprite, ticks }) => {
  const start = blows.length ? lastOf(blows).end : rushAt;
  blows.push({ sprite, start, strikeAt: start + zipTicks + windTicks, end: start + ticks });
  return blows;
}, []);

export const RUSH_END = lastOf(RUSH_BLOWS).end;
// the zip back to where he started, then the echoes wake
export const WAKE_AT = RUSH_END + zipTicks;

export function blowAt(time) {
  return RUSH_BLOWS.findIndex(({ start, end }) => time >= start && time < end);
}

// zipping in, winding up on the frame before the blow's strike frame, then holding the strike
export function rushFrame(time) {
  const blow = RUSH_BLOWS[blowAt(time)];
  if (!blow || time < blow.start + zipTicks) {
    return ZIP_FRAME;
  }
  const [strip, strike] = blow.sprite;
  return [strip, time < blow.strikeAt ? strike - 1 : strike, FISTS_ROW];
}
