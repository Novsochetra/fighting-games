import { paintCrowd } from '../crowd/crowd.js';
import { hash2 } from '../kit/hash.js';
import { tint } from '../kit/raster.js';
import { inAisle, paintAisles, paintSteps, paintWall } from './tier.js';
import { paintRing, paintRoof } from './roof.js';

// a bowl of stands from its front wall up: tier after tier of fans, a ring of lights between
// tiers, and a roof over the top that keeps the back rows in shade. Every height is fixed over the
// bottom of the picture, so the bowl stands the same in front of any pitch
function steps(art) {
  return {
    riser: art.concrete[0],
    edge: art.concrete[2],
    seat: art.seats.shade,
    stair: art.concrete[2],
    stairEdge: art.concrete[3],
  };
}

function paintTier(raster, { bottom, tier, art, frame }) {
  const height = tier.rows * tier.rowPitch;
  const area = { x: 0, y: bottom - height, width: raster.width, height };
  const shape = { area, rowPitch: tier.rowPitch, aisles: tier.aisles };

  paintSteps(raster, { ...shape, colours: steps(art) });
  paintAisles(raster, { ...shape, colours: steps(art) });
  paintCrowd(raster, {
    area,
    size: tier.size,
    rowPitch: tier.rowPitch,
    palette: art.crowd,
    frame,
    filled: (x, row) => !inAisle(x, shape) && hash2(x, row, 41) < tier.fill,
  });

  return area.y;
}

function shade(raster, { from, to, colour, share }) {
  for (let y = Math.max(0, from); y < Math.min(raster.height, to); y += 1) {
    const depth = share * (1 - ((y - from) / Math.max(1, to - from)) * 0.5);

    for (let x = 0; x < raster.width; x += 1) {
      tint(raster, x, y, { colour, share: depth });
    }
  }
}

export function paintBowl(raster, { art, frame, plan }) {
  let bottom = raster.height - plan.wall;

  paintWall(
    raster,
    { x: 0, y: bottom, width: raster.width, height: plan.wall },
    art.concrete.slice(1),
  );

  plan.tiers.forEach((tier, i) => {
    bottom = paintTier(raster, { bottom, tier, art, frame });

    if (i < plan.tiers.length - 1) {
      bottom = paintRing(raster, { bottom, art, height: plan.ring });
    }
  });

  shade(raster, {
    from: bottom - 20,
    to: bottom + plan.shadeRows,
    colour: art.shadow,
    share: plan.shade,
  });

  if (plan.night) {
    shade(raster, { from: bottom, to: raster.height, colour: art.shadow, share: plan.night });
  }

  paintRoof(raster, { bottom: bottom + 6, art, lamps: plan.lamps });
}
