import { FX_COLORS } from '../../art/fx-colors.js';
import { HERO_MOVE_SPRITES, HERO_SPRITES } from '../../data/hero-sprites.js';
import { clamp, easeOutCubic } from '../../lib/math.js';
import { soldierTiming } from '../../sim/summons/soldiers.js';
import { heroSheetFor } from '../fighters/hero-sheets.js';
import { drawHeroFrame } from '../fighters/hero-sprites.js';

const SWORD_ROW = 0;
const SOLID = 0.95;
// it starts this far under the ground, so it rises out of the stone whole
const SUNK = 40;
// half a world px is one pixel of the hero's sprite: a one-pixel rim of light round its top and sides
const RIM = [
  [-0.5, 0],
  [0.5, 0],
  [0, -0.5],
];
const FLASH_TICKS = 2;
// the frame each of the hero's attack strips strikes on
const STRIKE_FRAME = Object.fromEntries(Object.values(HERO_MOVE_SPRITES));
const TICKS_PER_FRAME = 2;
// px it steps forward with every blow
const STEP = 3;

// the move of its chain it is fighting: each from halfway after the blow before to halfway after its own
function moveIndex(time, beats) {
  let index = 0;
  while (index + 1 < beats.length && time >= (beats[index] + beats[index + 1]) / 2) {
    index++;
  }
  return index;
}

// the hero's own strip for the move it is fighting, played so the move's strike frame lands on its
// beat: winding up before it, following through after it, holding the last frame
export function soldierFrame(soldier) {
  const { beats } = soldierTiming(soldier);
  const index = moveIndex(soldier.time, beats);
  const strip = soldier.moves[index];
  const frame = STRIKE_FRAME[strip] + Math.floor((soldier.time - beats[index]) / TICKS_PER_FRAME);
  return [strip, clamp(frame, 0, HERO_SPRITES.frames[strip] - 1)];
}

// it steps forward with every blow it strikes
export function soldierStep(soldier) {
  return soldierTiming(soldier).beats.filter((beat) => soldier.time >= beat).length * STEP;
}

// how far under the ground it stands: rising out of it whole, then sinking halfway back as it crumbles
export function soldierSunk(soldier) {
  const { wait, rise, crumble, end } = soldierTiming(soldier);
  const risen = easeOutCubic(clamp((soldier.time - wait) / rise, 0, 1));
  const fallen = clamp((soldier.time - crumble) / (end - crumble), 0, 1) ** 2;
  return (1 - risen) * SUNK + (fallen * SUNK) / 2;
}

// solid once out of the ground, fading as it crumbles
export function soldierAlpha(soldier) {
  const { crumble, end } = soldierTiming(soldier);
  if (soldier.time < crumble) {
    return SOLID;
  }
  return (SOLID * Math.max(0, end - soldier.time)) / (end - crumble);
}

function striking(soldier) {
  const { beats } = soldierTiming(soldier);
  return beats.some((beat) => soldier.time >= beat && soldier.time < beat + FLASH_TICKS);
}

// carved like the Bayon's reliefs: the hero's own shape in sandstone, lit gold at its edges, flashing
// as it strikes; only what has risen above the ground is drawn
function drawSoldier(painter, sheet, soldier) {
  const at = {
    frame: soldierFrame(soldier),
    x: soldier.x + soldier.direction * soldierStep(soldier),
    y: soldier.y + soldierSunk(soldier),
    facing: soldier.direction,
    row: SWORD_ROW,
  };
  const alpha = soldierAlpha(soldier);
  const context = painter.context;
  context.save();
  context.beginPath();
  context.rect(soldier.x - 64, soldier.y - 96, 128, 97);
  context.clip();
  painter.alpha(alpha);
  drawHeroFrame(painter, sheet, { ...at, x: at.x + 1, tint: FX_COLORS.reliefShade });
  for (const [dx, dy] of RIM) {
    drawHeroFrame(painter, sheet, { ...at, x: at.x + dx, y: at.y + dy, tint: FX_COLORS.reliefRim });
  }
  drawHeroFrame(painter, sheet, { ...at, tint: FX_COLORS.reliefStone, relief: true });
  if (striking(soldier)) {
    painter.alpha(alpha * 0.35);
    drawHeroFrame(painter, sheet, { ...at, tint: FX_COLORS.reliefRim });
  }
  painter.alpha(1);
  context.restore();
}

export function drawSoldiers(painter, { summons, view }) {
  for (const soldier of summons) {
    if (soldier.kind === 'soldier' && soldier.time > soldierTiming(soldier).wait) {
      drawSoldier(painter, heroSheetFor(view, soldier.hero), soldier);
    }
  }
}
