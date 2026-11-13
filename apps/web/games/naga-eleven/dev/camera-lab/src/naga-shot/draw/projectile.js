import { breakAt, serpentAt } from '../tracks/serpent.js';
import { framesOf } from './projectile/body.js';
import { drawBurst } from './projectile/burst.js';
import { drawBurningEye } from './projectile/eye.js';
import { drawFigure } from './projectile/figure.js';
import { auraOf, glowRound } from './projectile/glow.js';
import { underPen } from './projectile/pixels.js';
import { drawSheen } from './projectile/sheen.js';
import { layDown, openSheet } from './projectile/sheet.js';
import { drawSparks } from './projectile/sparks.js';
import { drawWind } from './projectile/wind.js';

const RIDING = ['impact', 'flight', 'keeper'];

function drawRide(pen, moment) {
  const serpent = serpentAt(moment.flight, moment.ending);

  if (!serpent) {
    return;
  }

  const { frame } = moment.clock;
  const sheet = openSheet(pen);
  const frames = framesOf(serpent.joints);
  const place = drawFigure(sheet, { serpent, frames, frame });
  const behind = underPen(sheet);

  glowRound(sheet, auraOf({ frame, burn: serpent.burn }));
  drawBurningEye(sheet, { place, burn: serpent.burn, frame });
  drawWind(behind, { serpent, frames });
  drawSparks(behind, { serpent, frame });
  drawSheen(sheet, { frames, place });
  layDown(pen, sheet);
}

const BREAKING = ['collision', 'aftermath'];

function drawBreak(pen, moment) {
  const broken = breakAt(moment.clock);

  if (broken.life >= 1) {
    return;
  }

  const sheet = openSheet(pen);

  drawBurst(sheet, { ending: moment.ending, broken, frame: moment.clock.frame });

  if (broken.life < 0.3) {
    glowRound(sheet);
  }

  layDown(pen, sheet);
}

export function drawProjectile(pen, moment) {
  if (RIDING.includes(moment.clock.stage)) {
    drawRide(pen, moment);
  } else if (BREAKING.includes(moment.clock.stage)) {
    drawBreak(pen, moment);
  }
}
