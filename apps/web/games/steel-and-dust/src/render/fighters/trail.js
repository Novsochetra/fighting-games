import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { WEAPONS } from '../../data/weapons/index.js';
import { isPlayer } from '../../sim/fighters/loadout.js';
import { point } from '../painter.js';

function fillSmear(context, trail) {
  context.beginPath();
  context.moveTo(trail[0].tipX, trail[0].tipY);
  for (const step of trail) {
    context.lineTo(step.tipX, step.tipY);
  }
  for (let i = trail.length - 1; i >= 0; i--) {
    context.lineTo(trail[i].innerX, trail[i].innerY);
  }
  context.closePath();
  context.fill();
}

// the smear of a swing; hero sprites have their own smear drawn in
export function drawTrail(painter, { fighter, sheet }) {
  const trail = fighter.trail;
  if (trail.length < 2 || (isPlayer(fighter) && sheet.ready)) {
    return;
  }
  const context = painter.context;
  context.globalAlpha = 0.5;
  context.fillStyle = isPlayer(fighter)
    ? WEAPONS[fighter.weapon.id].trailColor
    : FX_COLORS.enemyTrail;
  fillSmear(context, trail);
  context.globalAlpha = 0.9;
  for (let i = 1; i < trail.length; i++) {
    const from = point(trail[i - 1].tipX, trail[i - 1].tipY);
    painter.use(COLORS.white).line(from, point(trail[i].tipX, trail[i].tipY), 1);
  }
  context.globalAlpha = 1;
}
