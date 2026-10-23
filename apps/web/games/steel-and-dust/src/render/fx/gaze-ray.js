import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { PIXEL, flicker, inLight, snap, steppedLevel } from './fine-pixels.js';
import { createRunFill } from './run-fill.js';

// the ray shows for the last ticks before a pillar bursts and its first ones, shooting out of his
// eyes to the spot over its first few
export const RAY_LEAD = 10;
export const RAY_AFTER = 4;
const SHOOT_TICKS = 3;
// motes of light run down it from his eyes to the spot, this share of the way each tick
const MOTE_SPEED = 0.15;
const MOTES = 3;
// the glow round it flickers between these strengths, and its edge in stretches this many steps long
const GLOW_LEVELS = [0.2, 0.3, 0.42];
const CHUNK = 8;

// the ray's bands, in screen pixels square to it (odd, so each sits centered on the core): the
// white-hot core, the gold body, the ember edge and the glow round it; thin as it shoots out, swelling
// as the pillar gathers, widest as it bursts, and thin again as it dies
const RAY_STAGES = [
  { until: -RAY_LEAD + SHOOT_TICKS, bands: [1, 1, 3, 7] },
  { until: -3, bands: [1, 3, 5, 9] },
  { until: 0, bands: [1, 3, 7, 11] },
  { until: 2, bands: [3, 7, 9, 15] },
  { until: Infinity, bands: [1, 1, 3, 7] },
];

export const rayBands = (time) => RAY_STAGES.find((stage) => time < stage.until).bands;

export const rayReach = (time) => Math.min(1, (time + RAY_LEAD + 1) / SHOOT_TICKS);

// how far down the ray each mote has run, as a share of its length, while the ray reaches it
export function rayMotes(time) {
  const since = time + RAY_LEAD;
  const reach = rayReach(time);
  return Array.from({ length: MOTES }, (_, i) => (since * MOTE_SPEED + i / MOTES) % 1).filter(
    (share) => share <= reach,
  );
}

// the ray is stepped one screen pixel at a time along its longer axis; each step lays its bands
// across the other, stretched so they keep their width square to the ray at any slant
function stepsOf(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const major = Math.max(Math.abs(dx), Math.abs(dy), PIXEL);
  return {
    from,
    dx,
    dy,
    count: Math.round(major / PIXEL),
    stretch: Math.hypot(dx, dy) / major,
    flat: Math.abs(dx) >= Math.abs(dy),
  };
}

const stepAt = (line, i) => ({
  x: line.from.x + (line.dx * i) / line.count,
  y: line.from.y + (line.dy * i) / line.count,
});

function drawBand(context, { line, steps, widthAt, color }) {
  context.fillStyle = color;
  const fills = createRunFill(context);
  for (let i = 0; i <= steps; i++) {
    const at = stepAt(line, i);
    const extra = Math.round(((widthAt(i) - 1) / 2) * line.stretch) * PIXEL;
    const across = extra * 2 + PIXEL;
    if (line.flat) {
      fills.add(snap(at.x), snap(at.y - PIXEL / 2) - extra, PIXEL, across);
    } else {
      fills.add(snap(at.x - PIXEL / 2) - extra, snap(at.y), across, PIXEL);
    }
  }
  fills.flush();
}

// a bead of white light with a gold halo, running down the ray
function drawMote(context, at) {
  const x = snap(at.x - PIXEL / 2);
  const y = snap(at.y - PIXEL / 2);
  context.fillStyle = FX_COLORS.gazeGold;
  context.fillRect(x - PIXEL * 2, y - PIXEL, PIXEL * 5, PIXEL * 3);
  context.fillRect(x - PIXEL, y - PIXEL * 2, PIXEL * 3, PIXEL * 5);
  context.fillStyle = COLORS.white;
  context.fillRect(x - PIXEL, y, PIXEL * 3, PIXEL);
  context.fillRect(x, y - PIXEL, PIXEL, PIXEL * 3);
}

// the gaze: a beam of gold from the guardian's eyes down onto the spot, its glow flickering, its
// core white-hot, and motes of light running down it
export function drawGazeRay(painter, pillar) {
  const context = painter.context;
  const line = stepsOf(pillar.eyes, { x: pillar.x, y: pillar.y });
  const steps = Math.round(line.count * rayReach(pillar.time));
  const [core, body, edge, glow] = rayBands(pillar.time);
  const beat = pillar.time >> 1;
  const seed = Math.round(pillar.x);
  const ray = { line, steps };
  inLight(context, () => {
    context.globalAlpha = steppedLevel(GLOW_LEVELS, seed, beat);
    const jitter = (i) => (flicker(seed + Math.floor(i / CHUNK), beat) < 0.5 ? 0 : 2);
    drawBand(context, { ...ray, widthAt: (i) => glow + jitter(i), color: FX_COLORS.gazeEmber });
    context.globalAlpha = 0.45;
    drawBand(context, { ...ray, widthAt: () => edge + 2, color: FX_COLORS.gazeGold });
  });
  context.globalAlpha = pillar.time >= 2 ? 0.6 : 1;
  drawBand(context, { ...ray, widthAt: () => edge, color: FX_COLORS.gazeEmber });
  drawBand(context, { ...ray, widthAt: () => body, color: FX_COLORS.gazeGold });
  drawBand(context, { ...ray, widthAt: () => core, color: COLORS.white });
  for (const share of rayMotes(pillar.time)) {
    drawMote(context, stepAt(line, Math.round(line.count * share)));
  }
  context.globalAlpha = 1;
}
