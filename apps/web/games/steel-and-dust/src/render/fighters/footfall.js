import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { easeOutCubic } from '../../lib/math.js';
import { lastFootfall } from '../../sim/bosses/stomp.js';
import { PIXEL, ellipseRows, fillRows, snap } from '../fx/fine-pixels.js';

// a footfall of the colossus throws a puff of dust out along the road either side of the foot for
// a few ticks, thinning in steps; once he glows, a seam of gold flashes in the stone under it
const PUFF_TICKS = 12;
const PUFF_SPREAD = 14;
const PUFF_FADES = [0.9, 0.7, 0.5, 0.3];
// each side's puff rolls out as a big lobe with a smaller one trailing it
const LOBES = [
  { out: 1, size: 1, up: 0 },
  { out: 0.55, size: 0.7, up: 1 },
];
const FLASH_TICKS = 6;
const FLASH_COLORS = [COLORS.white, FX_COLORS.gazeGold, FX_COLORS.gazeEmber];

export function footfallPuff(since) {
  return {
    spread: snap(4 + easeOutCubic(since / PUFF_TICKS) * PUFF_SPREAD),
    radius: snap(2 + since * 0.4),
    rise: snap(since * 0.2),
    alpha: PUFF_FADES[Math.min(PUFF_FADES.length - 1, Math.floor(since / 3))],
  };
}

export const isStomping = (fighter) =>
  fighter.state === 'walk' &&
  fighter.ai?.stride !== undefined &&
  lastFootfall(fighter).since < PUFF_TICKS;

function drawLobe(context, { x, y, radius, side }) {
  context.fillStyle = FX_COLORS.footDust;
  fillRows(context, { x, y, rows: ellipseRows(radius * 1.4, radius * 0.7) });
  context.fillStyle = FX_COLORS.dustHighlight;
  fillRows(context, {
    x: x - side * PIXEL,
    y: y - radius * 0.5,
    rows: ellipseRows(radius * 0.7, PIXEL),
  });
}

function drawPuffs(context, { x, floor, since }) {
  const puff = footfallPuff(since);
  context.globalAlpha = puff.alpha;
  for (const side of [-1, 1]) {
    for (const lobe of LOBES) {
      const radius = puff.radius * lobe.size;
      drawLobe(context, {
        x: x + side * puff.spread * lobe.out,
        y: floor - radius * 0.5 - puff.rise - lobe.up,
        radius,
        side,
      });
    }
  }
  context.globalAlpha = 1;
}

function drawFlash(context, { x, floor, since }) {
  const reach = snap(9 + since * 2);
  context.globalAlpha = 1 - since / FLASH_TICKS;
  context.fillStyle = FLASH_COLORS[Math.min(2, Math.floor(since / 2))];
  context.fillRect(snap(x) - reach, snap(floor), reach * 2, PIXEL);
  const inner = snap(reach / 2);
  context.fillRect(snap(x) - inner, snap(floor) + PIXEL, inner * 2, PIXEL);
  context.globalAlpha = 1;
}

// the foot came down where it now stands less the ground he has walked on since
export function drawFootfall(context, { fighter, floor }) {
  const { x, since } = lastFootfall(fighter);
  const foot = { x: x - fighter.vx * since, floor, since };
  drawPuffs(context, foot);
  if (fighter.glowing && since < FLASH_TICKS) {
    drawFlash(context, foot);
  }
}
