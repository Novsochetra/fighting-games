import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { CHARGE_LEVEL1, CHARGE_MAX, CHARGE_TAP } from '../../config.js';
import { WEAPONS } from '../../data/weapons/index.js';
import { heroAnimation } from '../../sim/hero-animation.js';
import { drawHeroAfterimages } from './afterimages.js';
import { drawHeavyLayer, heavyGlowColor, heavyLeanX } from './heavy-glow.js';
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

// dim glow while charging, full glow at level 1, flickering gold at max; the ultimate's own color;
// a heavy's own wind-up glow (heavy-glow.js)
function glowColor(fighter, { tickCount, theme, heroId }) {
  if (fighter.state === 'ult') {
    return theme.ult.edge;
  }
  const heavy = heavyGlowColor(fighter, heroId);
  if (heavy) {
    return heavy;
  }
  if (fighter.state !== 'charge' || fighter.stateTime < CHARGE_TAP) {
    return null;
  }
  if (fighter.stateTime >= CHARGE_MAX) {
    return (tickCount >> 2) & 1 ? COLORS.gold : COLORS.cream;
  }
  return fighter.stateTime >= CHARGE_LEVEL1 ? theme.glow : theme.glowDim;
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

// an ultimate frame may name its own weapon row: Bokator rushes bare-handed whatever he holds
export function drawHeroFighter(painter, { sheet, fighter, shakeX: shake, tickCount }) {
  const shakeX = shake + heavyLeanX(fighter, sheet.heroId);
  drawHeroAfterimages(painter, sheet, fighter);
  const layers = { fighter, heroId: sheet.heroId, tickCount };
  drawHeavyLayer(painter, 'under', layers);
  const frame = heroAnimation(fighter);
  const row = frame[2] ?? WEAPONS[fighter.weapon.id].spriteRow;
  const color = glowColor(fighter, { tickCount, theme: sheet.theme, heroId: sheet.heroId });
  if (color) {
    drawGlow(painter, sheet, { fighter, frame, row, shakeX, color });
  }
  const at = { frame, x: fighter.x + shakeX, y: fighter.y, facing: fighter.facing, row };
  drawHeroFrame(painter, sheet, { ...at, tint: hitTint(fighter) });
  // turned slow as stone by the guardian's gaze: grey stone washed over the hero
  if (fighter.stoned) {
    painter.alpha(0.62);
    drawHeroFrame(painter, sheet, { ...at, tint: FX_COLORS.stoneSkin });
    painter.alpha(1);
  }
  drawHeavyLayer(painter, 'over', layers);
}
