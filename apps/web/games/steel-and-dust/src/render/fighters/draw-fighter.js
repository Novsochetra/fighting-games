import {
  ARMOR_PALETTE,
  FLASH_PALETTE,
  ICE_PALETTE,
  TELEGRAPH_PALETTE,
} from '../../art/tinted-palettes.js';
import { BODY_ART } from '../../art/weapon-art.js';
import { isOutOfReach } from '../../sim/combat/boxes.js';
import { isPlayer } from '../../sim/fighters/loadout.js';
import { drawSkeletonAfterimages } from './afterimages.js';
import { drawBody } from './body.js';
import { drawDangerZone } from './danger-zone.js';
import { drawEnemyHealth, drawWindupWarning } from './enemy-markers.js';
import { drawSpriteEnemy } from './enemy-fighter.js';
import { enemySheetReady } from './enemy-sheets.js';
import { drawHeroFighter } from './hero-fighter.js';
import { isBossWindingUp, isTelegraphing } from './windup.js';

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

function drawShadow(painter, fighter, floor) {
  const height = floor - fighter.y;
  const width = Math.max(6, Math.round(14 * fighter.scale - height * 0.12));
  painter
    .alpha(0.35)
    .use(BODY_ART.shadow)
    .rect(fighter.x - width / 2, floor, width, 2);
  painter.alpha(1);
}

function hitShakeOffset(fighter) {
  if (fighter.hitShake > 0 && fighter.hitstop > 0) {
    return fighter.hitstop & 1 ? 1 : -1;
  }
  return 0;
}

function bodyPalette(fighter, tickCount) {
  if (fighter.flashTime > 0) {
    return FLASH_PALETTE;
  }
  if (fighter.armorFlash > 0) {
    return ARMOR_PALETTE;
  }
  if (fighter.frozen) {
    return ICE_PALETTE;
  }
  return isTelegraphing(fighter, tickCount) ? TELEGRAPH_PALETTE : fighter.palette;
}

function drawSkeletonFighter(painter, { fighter, shakeX, tickCount, floor }) {
  if (isBossWindingUp(fighter)) {
    drawDangerZone(painter, fighter, tickCount, floor);
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

// the floor is the surface under the fighter, worked out by the caller from the terrain
export function drawFighter(painter, { fighter, sheet, enemySheets, tickCount, floor }) {
  if (!fighter.joints || isBlinkedOut(fighter, tickCount)) {
    return;
  }
  // a raider dropping from overhead has its shadow drawn on the spot it falls on (drop-shadow.js)
  if (!isOutOfReach(fighter) && !fighter.dropping) {
    drawShadow(painter, fighter, floor);
  }
  const shakeX = hitShakeOffset(fighter);
  if (isPlayer(fighter) && sheet.ready) {
    drawHeroFighter(painter, { sheet, fighter, shakeX, tickCount });
  } else if (!isPlayer(fighter) && enemySheetReady(enemySheets, fighter.def.sprite)) {
    drawSpriteEnemy(painter, { sheets: enemySheets, fighter, shakeX, tickCount, floor });
  } else {
    drawSkeletonFighter(painter, { fighter, shakeX, tickCount, floor });
  }
}
