import { COLORS } from '../../art/colors.js';
import { HUD_COLORS } from '../../art/hud-colors.js';
import { GROUND_Y } from '../../config.js';
import { attackBox, crateBox, hurtBox } from '../../sim/combat/boxes.js';
import { drawText } from '../text/draw-text.js';

function drawFighterBoxes(painter, fighter) {
  const body = hurtBox(fighter);
  if (body) {
    painter.use(COLORS.mint).outline(body.x, body.y, body.width, body.height);
  }
  if (fighter.state === 'attack' && fighter.hitboxActive && fighter.move) {
    const hit = attackBox(fighter, fighter.move.hitbox);
    painter
      .alpha(0.45)
      .use(COLORS.red)
      .rect(hit.x, hit.y, Math.round(hit.width), Math.round(hit.height));
    painter.alpha(1).use(COLORS.coral).outline(hit.x, hit.y, hit.width, hit.height);
  }
  drawText(painter, fighter.state + (fighter.hasToken ? ' T' : ''), {
    x: fighter.x,
    y: fighter.y - 56 * fighter.scale,
    color: HUD_COLORS.debugText,
    align: 'center',
  });
}

export function drawDebugBoxes(painter, game) {
  for (const fighter of game.fighters) {
    drawFighterBoxes(painter, fighter);
  }
  for (const wave of game.shockwaves) {
    painter
      .alpha(0.45)
      .use(COLORS.red)
      .rect(wave.x - 6, GROUND_Y - 12, 12, 12);
    painter.alpha(1);
  }
  for (const crate of game.crates) {
    if (!crate.broken) {
      const box = crateBox(crate);
      painter.use(HUD_COLORS.frameStartup).outline(box.x, box.y, box.width, box.height);
    }
  }
}
