import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { attackBox } from '../../sim/combat/boxes.js';
import { drawText } from '../text/draw-text.js';

function chargeLane(painter, fighter, floor) {
  const x = fighter.facing > 0 ? fighter.x : fighter.x - 130;
  painter.use(COLORS.red).rect(x, floor - 1, 130, 6);
  for (let i = 1; i < 6; i++) {
    drawText(painter, fighter.facing > 0 ? '>' : '<', {
      x: fighter.x + fighter.facing * i * 22,
      y: floor - 9,
      color: COLORS.coral,
      align: 'center',
      shadow: null,
    });
  }
}

function slamZone(painter, fighter, floor) {
  const move = fighter.move;
  const box = attackBox(fighter, move.hitbox);
  const extra = move.id === 'slam' ? 40 : 0;
  painter.use(COLORS.red).rect(box.x - extra, floor - 1, box.width + extra * 2, 6);
  painter.use(FX_COLORS.dangerLight).rect(box.x - extra, floor - 1, box.width + extra * 2, 1);
}

// boss wind-ups mark the ground they are about to hit, on the floor the boss stands on
export function drawDangerZone(painter, fighter, tickCount, floor) {
  const move = fighter.move;
  const progress = 1 - (move.startup - fighter.moveTime) / move.startup;
  painter.alpha(0.3 + 0.4 * progress * ((tickCount >> 2) & 1 ? 1 : 0.55));
  if (move.id === 'charge') {
    chargeLane(painter, fighter, floor);
  } else {
    slamZone(painter, fighter, floor);
  }
  painter.alpha(1);
}
