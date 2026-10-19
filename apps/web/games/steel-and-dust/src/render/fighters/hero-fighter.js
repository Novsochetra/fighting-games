import { COLORS } from '../../art/colors.js';
import { CHARGE_LEVEL1, CHARGE_MAX, CHARGE_TAP } from '../../config.js';
import { WEAPONS } from '../../data/weapons/index.js';
import { heroAnimation } from '../../sim/hero-animation.js';
import { drawHeroAfterimages } from './afterimages.js';
import { drawHeroFrame } from './hero-sprites.js';

const OUTER_GLOW = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [-1, -1],
  [1, -1],
];
const INNER_GLOW = [
  [-0.5, 0],
  [0.5, 0],
  [0, -0.5],
  [0, 0.5],
];

// dim blue while charging, blue at level 1, flickering gold at max and during the ultimate
function glowColor(fighter, tickCount) {
  if (fighter.state === 'ult') {
    return COLORS.gold;
  }
  if (fighter.state !== 'charge' || fighter.stateTime < CHARGE_TAP) {
    return null;
  }
  if (fighter.stateTime >= CHARGE_MAX) {
    return (tickCount >> 2) & 1 ? COLORS.gold : COLORS.cream;
  }
  return fighter.stateTime >= CHARGE_LEVEL1 ? COLORS.cyan : COLORS.ocean;
}

function hitTint(fighter) {
  if (fighter.flashTime > 0) {
    return COLORS.white;
  }
  return fighter.armorFlash > 0 ? COLORS.gold : null;
}

function drawGlow(painter, sheet, { fighter, frame, row, shakeX, color }) {
  const at = (dx, dy) => ({
    frame,
    x: fighter.x + shakeX + dx,
    y: fighter.y + dy,
    facing: fighter.facing,
    tint: color,
    row,
  });
  painter.alpha(0.4);
  for (const [dx, dy] of OUTER_GLOW) {
    drawHeroFrame(painter, sheet, at(dx, dy));
  }
  painter.alpha(0.95);
  for (const [dx, dy] of INNER_GLOW) {
    drawHeroFrame(painter, sheet, at(dx, dy));
  }
  painter.alpha(1);
}

export function drawHeroFighter(painter, { sheet, fighter, shakeX, tickCount }) {
  const row = WEAPONS[fighter.weapon.id].spriteRow;
  drawHeroAfterimages(painter, sheet, fighter);
  const frame = heroAnimation(fighter);
  const color = glowColor(fighter, tickCount);
  if (color) {
    drawGlow(painter, sheet, { fighter, frame, row, shakeX, color });
  }
  drawHeroFrame(painter, sheet, {
    frame,
    x: fighter.x + shakeX,
    y: fighter.y,
    facing: fighter.facing,
    tint: hitTint(fighter),
    row,
  });
}
