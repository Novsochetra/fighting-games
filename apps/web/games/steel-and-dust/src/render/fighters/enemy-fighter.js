import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { ENEMY_SPRITES } from '../../data/enemies/enemy-sprites.js';
import { enemyAnimation } from '../../sim/enemy-animation.js';
import { drawDangerZone } from './danger-zone.js';
import { drawEnemyHealth, drawWindupWarning } from './enemy-markers.js';
import { drawEnemyFrame, spriteSize } from './enemy-sprites.js';
import { drawMirages } from './mirages.js';
import { isBossWindingUp, isTelegraphing } from './windup.js';

function hitTint(fighter) {
  if (fighter.flashTime > 0) {
    return COLORS.white;
  }
  if (fighter.frozen) {
    return FX_COLORS.iceBody;
  }
  return fighter.armorFlash > 0 ? COLORS.gold : null;
}

function drawAfterimages(painter, sheets, fighter) {
  for (const image of fighter.afterimages) {
    if (!image.sprite) {
      continue;
    }
    painter.alpha((0.45 * image.life) / 12);
    drawEnemyFrame(painter, sheets, {
      id: fighter.def.sprite,
      frame: image.sprite,
      x: image.x,
      y: image.y,
      facing: image.facing,
      tint: FX_COLORS[image.ghost] ?? FX_COLORS.enemyGhost,
      size: spriteSize(fighter),
    });
  }
  painter.alpha(1);
}

// a boss that has reformed glows: a gold rim one screen pixel round its sprite, pulsing
const RIM = [
  [-0.5, 0],
  [0.5, 0],
  [0, -0.5],
];

function drawRim(painter, sheets, at, tickCount) {
  painter.alpha(0.45 + 0.3 * Math.abs(Math.sin(tickCount / 14)));
  for (const [dx, dy] of RIM) {
    drawEnemyFrame(painter, sheets, {
      ...at,
      x: at.x + dx,
      y: at.y + dy,
      tint: FX_COLORS.guardianGlow,
    });
  }
  painter.alpha(1);
}

// the red wash over the sprite blinks in the last frames of a wind-up
function drawTelegraph(painter, sheets, at) {
  painter.alpha(0.55);
  drawEnemyFrame(painter, sheets, { ...at, tint: FX_COLORS.telegraph });
  painter.alpha(1);
}

export function drawSpriteEnemy(painter, { sheets, fighter, shakeX, tickCount, floor }) {
  if (isBossWindingUp(fighter)) {
    drawDangerZone(painter, fighter, tickCount, floor);
  }
  drawAfterimages(painter, sheets, fighter);
  const id = fighter.def.sprite;
  const at = {
    id,
    frame: enemyAnimation(fighter, ENEMY_SPRITES[id]),
    x: fighter.x + shakeX,
    y: fighter.y,
    facing: fighter.facing,
    size: spriteSize(fighter),
  };
  drawMirages(painter, sheets, { fighter, frame: at.frame, tickCount });
  if (fighter.glowing) {
    drawRim(painter, sheets, at, tickCount);
  }
  drawEnemyFrame(painter, sheets, { ...at, tint: hitTint(fighter) });
  if (isTelegraphing(fighter, tickCount)) {
    drawTelegraph(painter, sheets, at);
  }
  drawWindupWarning(painter, fighter, tickCount);
  drawEnemyHealth(painter, fighter);
}
