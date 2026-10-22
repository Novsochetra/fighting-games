import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { attackBox } from '../../sim/combat/boxes.js';
import { drawText } from '../text/draw-text.js';

function chargeLane(painter, fighter, { floor, direction }) {
  const length = fighter.move.lane ?? 130;
  const x = direction > 0 ? fighter.x : fighter.x - length;
  painter.use(COLORS.red).rect(x, floor - 1, length, 6);
  for (let i = 1; i < Math.round(length / 22); i++) {
    drawText(painter, direction > 0 ? '>' : '<', {
      x: fighter.x + direction * i * 22,
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

// boss wind-ups mark the ground they are about to hit, on the floor the boss stands on; a rush or
// a wave marks the lane it runs down, and a leap only the spot it lands on (pounce-mark.js)
export function drawDangerZone(painter, fighter, tickCount, floor) {
  const move = fighter.move;
  const progress = 1 - (move.startup - fighter.moveTime) / move.startup;
  painter.alpha(0.3 + 0.4 * progress * ((tickCount >> 2) & 1 ? 1 : 0.55));
  if (move.id === 'charge' || move.lane) {
    chargeLane(painter, fighter, { floor, direction: fighter.facing });
    if (move.laneBothWays) {
      chargeLane(painter, fighter, { floor, direction: -fighter.facing });
    }
  } else if (move.hitbox && !move.leapAt) {
    slamZone(painter, fighter, floor);
  }
  painter.alpha(1);
}
