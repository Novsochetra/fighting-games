import { HERO_MOVE_SPRITES, HERO_SPRITES } from '../../data/hero-sprites.js';
import { clamp, easeOutCubic } from '../../lib/math.js';
import { SOLDIER_TIMING } from '../../sim/summons/soldiers.js';
import { heroSheetFor } from '../fighters/hero-sheets.js';
import { drawCarved } from './carved.js';

const SWORD_ROW = 0;
const SOLID = 0.95;
// it starts this far under the ground, so it rises out of the stone whole
const SUNK = 40;
const FLASH_TICKS = 2;
const STRIP = 'thrust';
// the frame the hero's thrust strip strikes on
const STRIKE_FRAME = Object.fromEntries(Object.values(HERO_MOVE_SPRITES))[STRIP];
const TICKS_PER_FRAME = 2;
// px it steps forward as it thrusts
const STEP = 3;
const { rise, strike, crumble, end } = SOLDIER_TIMING;

// the hero's own thrust, played so its strike frame lands on the soldier's strike: winding up as it
// rises, following through after, holding the last frame
export function soldierFrame(soldier) {
  const frame = STRIKE_FRAME + Math.floor((soldier.time - strike) / TICKS_PER_FRAME);
  return [STRIP, clamp(frame, 0, HERO_SPRITES.frames[STRIP] - 1)];
}

// it steps forward as it thrusts
export function soldierStep(soldier) {
  return soldier.time >= strike ? STEP : 0;
}

// how far under the ground it stands: rising out of it whole, then sinking halfway back as it crumbles
export function soldierSunk(soldier) {
  const risen = easeOutCubic(clamp(soldier.time / rise, 0, 1));
  const fallen = clamp((soldier.time - crumble) / (end - crumble), 0, 1) ** 2;
  return (1 - risen) * SUNK + (fallen * SUNK) / 2;
}

// solid once out of the ground, fading as it crumbles
export function soldierAlpha(soldier) {
  if (soldier.time < crumble) {
    return SOLID;
  }
  return (SOLID * Math.max(0, end - soldier.time)) / (end - crumble);
}

function striking(soldier) {
  return soldier.time >= strike && soldier.time < strike + FLASH_TICKS;
}

// carved like the Bayon's reliefs (carved.js), flashing as it strikes; only what has risen above
// the ground is drawn
function drawSoldier(painter, sheet, soldier) {
  const at = {
    frame: soldierFrame(soldier),
    x: soldier.x + soldier.direction * soldierStep(soldier),
    y: soldier.y + soldierSunk(soldier),
    facing: soldier.direction,
    row: SWORD_ROW,
  };
  const context = painter.context;
  context.save();
  context.beginPath();
  context.rect(soldier.x - 64, soldier.y - 96, 128, 97);
  context.clip();
  drawCarved(painter, sheet, { at, alpha: soldierAlpha(soldier), flash: striking(soldier) });
  context.restore();
}

export function drawSoldiers(painter, { summons, view }) {
  for (const soldier of summons) {
    if (soldier.kind === 'soldier' && soldier.time > 0) {
      drawSoldier(painter, heroSheetFor(view, soldier.hero), soldier);
    }
  }
}
