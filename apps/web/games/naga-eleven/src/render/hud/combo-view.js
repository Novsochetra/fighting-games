import { PASS_COMBO } from '../../data/combos.js';

const POP_TICKS = 8;
export const BREAK_TICKS = 20;
const BURST_FADE = 6;
const CELL = 3;

function holdShare(match, side, tick) {
  const since = match.combo?.since ?? side.climbedAt;
  const hold = PASS_COMBO.holdTicks[match.format] ?? PASS_COMBO.holdTicks[11];

  return since === null || since === undefined
    ? 1
    : Math.min(1, Math.max(0, 1 - (tick - since) / hold));
}

// a climb pops the number: a cell bigger for the first half of POP_TICKS
function liveView(match, side, tick) {
  const climb = side.climbedAt === null ? Infinity : tick - side.climbedAt;

  return {
    level: side.level,
    mode: side.level >= PASS_COMBO.finisherFrom ? 'gold' : 'side',
    cell: climb < POP_TICKS / 2 ? CELL + 1 : CELL,
    shake: 0,
    alpha: 1,
    hold: holdShare(match, side, tick),
    live: true,
    burst: null,
  };
}

// a break shakes it 2 px and greys it out; a finisher bursts it into sparks
function endedView(side, age) {
  const base = { level: side.endLevel, cell: CELL, hold: 0, live: false };

  if (side.endBurst) {
    return {
      ...base,
      mode: 'gold',
      shake: 0,
      alpha: Math.max(0, 1 - age / BURST_FADE),
      burst: age,
    };
  }

  let mode = side.endLevel >= PASS_COMBO.finisherFrom ? 'gold' : 'side';

  if (age >= 4) {
    mode = 'grey';
  }

  const shake = age % 4 < 2 ? 2 : -2;

  return {
    ...base,
    mode,
    shake: age < 8 ? shake : 0,
    alpha: age < 10 ? 1 : 1 - (age - 10) / 10,
    burst: null,
  };
}

// what a side's counter shows this frame, or null while it shows nothing (README "HUD")
export function counterView(effects, match, team, tick = match.tick) {
  const side = effects?.combos?.[team];

  if (!side) {
    return null;
  }

  if (side.level >= PASS_COMBO.showFrom) {
    return liveView(match, side, tick);
  }

  const age = side.endedAt === null ? Infinity : tick - side.endedAt;

  return side.endLevel >= PASS_COMBO.showFrom && age >= 0 && age < BREAK_TICKS
    ? endedView(side, age)
    : null;
}
