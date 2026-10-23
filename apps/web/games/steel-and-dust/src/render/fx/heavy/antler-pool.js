import { ANTLER_HEAVY_ART as ART } from '../../../art/heavy-fx/antler.js';
import { PIXEL, ellipseRows, fillRows, flicker, ringRows, snap } from '../fine-pixels.js';

const FLAMES = 7;
const FLAT = 0.22;

const growthOf = (time, startup) => Math.min(1, (time + 1) / Math.max(1, startup - 1));

// tongues of ghost fire lick up off the near half of the pool's rim, each its own height a beat
function poolFlames(context, { x, y, rx, ry, beat }) {
  for (let i = 0; i < FLAMES; i++) {
    const angle = ((i + 0.5) / FLAMES) * Math.PI;
    const height = (1 + Math.floor(flicker(i, beat) * 4)) * PIXEL;
    const left = snap(x + Math.cos(angle) * rx);
    const top = snap(y + Math.sin(angle) * ry) - height;
    context.fillStyle = ART.flame[2];
    context.fillRect(left, top, PIXEL, height);
    context.fillStyle = ART.flame[0];
    context.fillRect(left, top - PIXEL, PIXEL, PIXEL);
  }
}

// ghost fire pools on the road round its hooves as it gathers, and spreads as the strike nears
export function drawPool(context, { fighter, move, time, tickCount }) {
  if (fighter.airborne || time > move.startup) {
    return;
  }
  const rx = snap(5 + growthOf(time, move.startup) * 8);
  const ry = Math.max(PIXEL, snap(rx * FLAT));
  const at = { x: fighter.x, y: fighter.y };
  context.globalAlpha = 0.35;
  context.fillStyle = ART.pool;
  fillRows(context, { ...at, rows: ellipseRows(rx, ry) });
  context.globalAlpha = 0.9;
  context.fillStyle = time >= move.startup - 2 ? ART.hot : ART.poolRim;
  fillRows(context, { ...at, rows: ringRows(rx, ry, 1) });
  poolFlames(context, { ...at, rx, ry, beat: tickCount >> 1 });
  context.globalAlpha = 1;
}
