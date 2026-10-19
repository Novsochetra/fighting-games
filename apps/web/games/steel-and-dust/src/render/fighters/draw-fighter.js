import { ARMOR_PALETTE, FLASH_PALETTE, TELEGRAPH_PALETTE } from '../../art/tinted-palettes.js';
import { BODY_ART } from '../../art/weapon-art.js';
import { GROUND_Y } from '../../config.js';
import { isPlayer } from '../../sim/fighters/loadout.js';
import { drawSkeletonAfterimages } from './afterimages.js';
import { drawBody } from './body.js';
import { drawDangerZone } from './danger-zone.js';
import { drawEnemyHealth, drawWindupWarning } from './enemy-markers.js';
import { drawHeroFighter } from './hero-fighter.js';

// knocked-out raiders blink out; the hero blinks while invincible after a hit
function isBlinkedOut(fighter, tickCount) {
  if (
    fighter.state === 'ko' &&
    !fighter.airborne &&
    fighter.stateTime > 30 &&
    (fighter.stateTime >> 2) % 2
  ) {
    return true;
  }
  const blinking = isPlayer(fighter) && fighter.state !== 'dash' && fighter.state !== 'ult';
  return fighter.invincible > 0 && blinking && (tickCount >> 2) % 2;
}

function drawShadow(painter, fighter) {
  const height = GROUND_Y - fighter.y;
  const width = Math.max(6, Math.round(14 * fighter.scale - height * 0.12));
  painter
    .alpha(0.35)
    .use(BODY_ART.shadow)
    .rect(fighter.x - width / 2, GROUND_Y, width, 2);
  painter.alpha(1);
}

function hitShakeOffset(fighter) {
  if (fighter.hitShake > 0 && fighter.hitstop > 0) {
    return fighter.hitstop & 1 ? 1 : -1;
  }
  return 0;
}

// the last frames of a raider's wind-up blink red
function bodyPalette(fighter, tickCount) {
  const move = fighter.move;
  const windingUp =
    fighter.side === 'enemy' && fighter.state === 'attack' && fighter.moveTime < move.startup;
  const telegraph = windingUp && move.startup - fighter.moveTime <= 10 && (tickCount >> 1) & 1;
  if (fighter.flashTime > 0) {
    return FLASH_PALETTE;
  }
  if (fighter.armorFlash > 0) {
    return ARMOR_PALETTE;
  }
  return telegraph ? TELEGRAPH_PALETTE : fighter.palette;
}

function isBossWindingUp(fighter) {
  return (
    fighter.side === 'enemy' &&
    fighter.def.boss &&
    fighter.state === 'attack' &&
    fighter.moveTime < fighter.move.startup
  );
}

function drawSkeletonFighter(painter, { fighter, shakeX, tickCount }) {
  if (isBossWindingUp(fighter)) {
    drawDangerZone(painter, fighter, tickCount);
  }
  drawSkeletonAfterimages(painter, fighter);
  const palette = bodyPalette(fighter, tickCount);
  if (shakeX) {
    painter.context.translate(shakeX, 0);
  }
  const { joints, pose } = fighter;
  drawBody(painter, {
    fighter,
    joints,
    pose,
    palette,
    ghost: false,
    headStyle: fighter.palette.headStyle,
  });
  if (shakeX) {
    painter.context.translate(-shakeX, 0);
  }
  if (fighter.side === 'enemy') {
    drawWindupWarning(painter, fighter, tickCount);
    drawEnemyHealth(painter, fighter);
  }
}

export function drawFighter(painter, { fighter, sheet, tickCount }) {
  if (!fighter.joints || isBlinkedOut(fighter, tickCount)) {
    return;
  }
  drawShadow(painter, fighter);
  const shakeX = hitShakeOffset(fighter);
  if (isPlayer(fighter) && sheet.ready) {
    drawHeroFighter(painter, { sheet, fighter, shakeX, tickCount });
    return;
  }
  drawSkeletonFighter(painter, { fighter, shakeX, tickCount });
}
