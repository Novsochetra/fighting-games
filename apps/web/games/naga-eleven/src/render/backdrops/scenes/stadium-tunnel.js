import { TUNNEL_ART } from '../../../art/backdrops/football.js';
import { glow, pickColor } from '../dither.js';
import { hash } from '../hash.js';
import { drawTwinkles } from '../parts/drift.js';
import { fillRect, hline, plot } from '../raster.js';

// The players' tunnel: concrete running away under its lamps to a square of light, the pitch and
// the packed stand beyond it, the roar coming down the walls. Each pixel finds which face of the
// tunnel it looks at and how deep, so the joints, lamps and the stripe all run true to the end.
const art = TUNNEL_ART;
const VANISH = { x: 192, y: 94 };
const HALF = { wall: 192, ceiling: 94, floor: 122 };
const END = 6;
const OPENING = {
  x: Math.round(VANISH.x - HALF.wall / END),
  y: Math.round(VANISH.y - HALF.ceiling / END),
  width: Math.round((HALF.wall * 2) / END),
  height: Math.round((HALF.ceiling + HALF.floor) / END),
};

// the lamps throw a pool of light on the walls and floor below each of them
const poolAt = (depth) => Math.max(0, 1 - Math.abs(((depth - 0.5) % 1) - 0.5) * 4) * 0.9;

function surfaceAt(x, y) {
  const dx = x + 0.5 - VANISH.x;
  const dy = y + 0.5 - VANISH.y;
  const wall = HALF.wall / Math.abs(dx || 0.01);
  const flat = dy < 0 ? HALF.ceiling / -dy : HALF.floor / Math.max(dy, 0.01);

  if (wall < flat) {
    return { face: 'wall', depth: wall, height: (dy * wall) / HALF.floor };
  }

  return { face: dy < 0 ? 'ceiling' : 'floor', depth: flat, across: (dx * flat) / HALF.wall };
}

function wallTone({ depth, height }) {
  const joint = (depth * 2) % 1 < 0.06 * depth;
  const stripe = height > -0.13 && height < -0.09;
  const skirting = height > 0.92;

  if (stripe) {
    return { ramp: [art.wall[1], art.banner[1], art.banner[0]], along: depth * 0.5 };
  }

  return {
    ramp: art.wall,
    along: 0.4 + depth * 1.05 + poolAt(depth) - (joint ? 1.2 : 0) - (skirting ? 1 : 0),
  };
}

function toneAt(surface) {
  const lamp = (surface.depth - 0.5) % 1;

  if (surface.face === 'wall') {
    return wallTone(surface);
  }

  if (surface.face === 'ceiling') {
    const lit = lamp < 0.12 && Math.abs(surface.across) < 0.3;

    return lit
      ? { ramp: art.light, along: 0 }
      : { ramp: art.wall, along: surface.depth * 0.9 - 0.5 };
  }

  const shine = Math.abs(surface.across) < 0.25 ? surface.depth * 0.12 : 0;

  return { ramp: art.floor, along: surface.depth * 0.45 + shine + poolAt(surface.depth) * 0.6 };
}

function paintBeyond(raster) {
  const { x, y, width, height } = OPENING;
  const stand = Math.round(y + height * 0.55);

  fillRect(raster, { x, y, width, height }, art.light[0]);

  for (let row = y + 3; row < stand; row += 1) {
    for (let column = x; column < x + width; column += 1) {
      plot(raster, column, row, art.crowd[Math.floor(hash(column, row) * 3) + (row % 2)]);
    }
  }

  fillRect(raster, { x, y: stand, width, height: y + height - stand }, art.pitch[1]);
  hline(raster, { x, y: stand, length: width }, art.pitch[2]);
  hline(raster, { x, y: stand + 3, length: width }, art.light[0]);
}

function paintTunnel(raster) {
  for (let y = 0; y < raster.height; y += 1) {
    for (let x = 0; x < raster.width; x += 1) {
      const surface = surfaceAt(x, y);

      if (surface.depth < END) {
        const { ramp, along } = toneAt(surface);

        plot(raster, x, y, pickColor(ramp, { at: along, x, y, edge: 0.5 }));
      }
    }
  }

  glow(raster, {
    x: VANISH.x,
    y: VANISH.y + 4,
    radius: 58,
    colors: [art.wall[5], art.wall[6], art.wall[7], art.light[2]],
    squash: 0.75,
  });
  paintBeyond(raster);
}

const FLASHES = Array.from({ length: 14 }, (_, i) => ({
  x: Math.round(OPENING.x + 1 + hash(i, 1) * (OPENING.width - 2)),
  y: Math.round(OPENING.y + 3 + hash(i, 2) * OPENING.height * 0.5),
}));

export const STADIUM_TUNNEL = {
  paint: paintTunnel,
  overlay: (context, tick) => {
    drawTwinkles(context, {
      points: FLASHES,
      colors: [art.crowd[1], art.crowd[2], art.crowd[3], art.flash[0], art.crowd[1], art.crowd[2]],
      tick,
      period: 9,
    });
  },
};
