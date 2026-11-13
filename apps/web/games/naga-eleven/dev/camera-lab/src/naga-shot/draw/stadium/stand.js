import { shiftedPen } from '../../../../../../src/render/duel/pen.js';
import { baked, stamp } from '../bake.js';
import { paintBalcony, paintBanners } from './balcony.js';
import { paintTier } from './crowd.js';
import { layerPen } from './layers.js';
import { CONCRETE, ROOF, ROOF_UNDER, STEEL } from './palette.js';
import { paintRoofLamps } from './roof-lamps.js';
import { AISLE_EVERY, AISLE_WIDTH, STAND, TIERS } from './stand-plan.js';

const WIDTH = STAND.right - STAND.left;

const shade = (ramp, step) => ramp[Math.max(0, Math.min(ramp.length - 1, step))];

function paintRoof(pen, dusk) {
  const lit = dusk >= 2 ? 1 : 2;

  pen.rect([STAND.left, STAND.roof, WIDTH, STAND.under - STAND.roof], ROOF[dusk >= 3 ? 0 : 1]);
  pen.rect([STAND.left, STAND.roof, WIDTH, 1], shade(ROOF, lit + 1 - Math.min(dusk, 2)));
  pen.rect([STAND.left, STAND.roof + 1, WIDTH, 1], ROOF[lit]);
  pen.rect([STAND.left, STAND.under - 2, WIDTH, 2], ROOF[0]);
  pen.rect([STAND.left, STAND.under, WIDTH, STAND.upper - STAND.under], ROOF_UNDER[0]);

  for (let x = STAND.left; x < STAND.right; x += 6) {
    pen.rect([x, STAND.under + 1, 3, 1], ROOF_UNDER[1]);
    pen.rect([x + 3, STAND.under + 2, 3, 1], ROOF_UNDER[1]);
  }
}

function paintAisles(pen, dusk) {
  for (let x = STAND.left; x < STAND.right; x += AISLE_EVERY) {
    TIERS.forEach((tier) => {
      for (let y = tier.top; y < tier.bottom; y += 2) {
        pen.rect([x, y, AISLE_WIDTH, 1], shade(CONCRETE, 2 - dusk));
        pen.rect([x, y + 1, AISLE_WIDTH, 1], shade(CONCRETE, 1 - dusk));
      }
    });

    if (((x - STAND.left) / AISLE_EVERY) % 2 === 0) {
      pen.rect([x + 1, STAND.under, 2, STAND.balcony - STAND.under], STEEL[0]);
      pen.rect([x + 1, STAND.under, 1, STAND.balcony - STAND.under], STEEL[1]);
    }
  }
}

function paintWall(pen, dusk) {
  pen.rect([STAND.left, STAND.wall, WIDTH, STAND.foot - STAND.wall], shade(CONCRETE, 1 - dusk));
  pen.rect([STAND.left, STAND.wall, WIDTH, 1], shade(CONCRETE, 3 - dusk));
}

function paintStand(pen, { dusk, pose }) {
  const at = shiftedPen(pen, -STAND.left, -STAND.roof);

  paintRoof(at, dusk);
  TIERS.forEach((tier) => paintTier(at, { tier, pose, dusk }));
  paintAisles(at, dusk);
  paintBalcony(at, dusk);
  paintBanners(at, dusk);
  paintWall(at, dusk);
  paintRoofLamps(at, dusk);
}

const standCanvas = (dusk, pose) =>
  baked(`stadium-stand-${dusk}-${pose}`, {
    width: WIDTH,
    height: STAND.foot - STAND.roof,
    paint: (pen) => paintStand(pen, { dusk, pose }),
  });

export function drawStand(context, { camera, dusk, cheer }) {
  const pen = layerPen(context, camera, 'stand');
  const canvas = standCanvas(dusk, dusk === 0 ? cheer : 0);

  if (canvas) {
    stamp(pen, canvas, { left: STAND.left, top: STAND.roof });

    return pen;
  }

  pen.rect([STAND.left, STAND.roof, WIDTH, STAND.foot - STAND.roof], ROOF_UNDER[1]);

  return pen;
}
