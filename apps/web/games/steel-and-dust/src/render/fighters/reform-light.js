import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { CHEST } from '../../sim/bosses/crumble.js';
import { bodyPoint } from '../../sim/fighters/body-point.js';
import { PIXEL, fineLine, inLight, snap } from '../fx/fine-pixels.js';
import { drawHalo, drawStar } from '../fx/light-star.js';

// before he reforms, motes of gold are drawn in out of the air to his heart in the rubble; as he
// reforms, light bursts out behind him in a column and rays, and a star flares at his heart
const GATHER_TICKS = 30;
const BURST_TICKS = 16;
const MOTES = 10;
const MOTE_FROM = 44;
const RAYS = 8;
const RAY_REACH = 46;
const COLUMN_HEIGHT = 130;
// the light gathers low in the rubble and rises to his heart as he builds himself back up
const RUBBLE_HEART = { ahead: CHEST.ahead, up: 8 };
// the column of light behind him is banded across and fades in steps up its height
const COLUMN_BANDS = [
  { color: FX_COLORS.gazeEmber, half: 1, alpha: 0.22 },
  { color: FX_COLORS.gazeGold, half: 0.6, alpha: 0.32 },
  { color: FX_COLORS.gazeWhite, half: 0.25, alpha: 0.6 },
];
const COLUMN_STEPS = 4;

// how far into the gathering (below 0) or the burst (0 to 1) his reforming is, or null outside it
export function reformPhase(fighter) {
  const reformAt = fighter.move?.reformAt;
  if (fighter.state !== 'attack' || reformAt === undefined) {
    return null;
  }
  const since = fighter.moveTime - reformAt;
  if (since < -GATHER_TICKS || since >= BURST_TICKS) {
    return null;
  }
  return since < 0 ? since / GATHER_TICKS : since / BURST_TICKS;
}

export function gatherMotes(heart, phase, time) {
  const share = phase + 1;
  return Array.from({ length: MOTES }, (_, i) => {
    const distance = (1 - ((share * 2 + i / MOTES) % 1)) * MOTE_FROM;
    const angle = (i * Math.PI * 2) / MOTES + time * 0.04;
    return { x: heart.x + Math.cos(angle) * distance, y: heart.y + Math.sin(angle) * distance };
  });
}

function drawGather(context, { heart, phase, time }) {
  drawHalo(context, { ...heart, radius: 2 + (phase + 1) * 5, strength: 0.6 + phase + 1 });
  for (const mote of gatherMotes(heart, phase, time)) {
    const x = snap(mote.x);
    const y = snap(mote.y);
    context.fillStyle = FX_COLORS.guardianGlow;
    context.fillRect(x - PIXEL, y, PIXEL * 3, PIXEL);
    context.fillRect(x, y - PIXEL, PIXEL, PIXEL * 3);
    context.fillStyle = COLORS.white;
    context.fillRect(x, y, PIXEL, PIXEL);
  }
}

function drawColumn(context, { heart, floor, fade }) {
  const width = 4 + fade * 16;
  const step = snap((COLUMN_HEIGHT * (0.8 + fade * 0.2)) / COLUMN_STEPS);
  inLight(context, () => {
    for (const band of COLUMN_BANDS) {
      const half = snap(width * band.half);
      context.fillStyle = band.color;
      for (let i = 0; i < COLUMN_STEPS; i++) {
        context.globalAlpha = band.alpha * fade * (1 - i / COLUMN_STEPS);
        context.fillRect(snap(heart.x) - half, snap(floor) - step * (i + 1), half * 2, step);
      }
    }
  });
  context.globalAlpha = 1;
}

function drawRays(context, { heart, phase, time }) {
  context.globalAlpha = 1 - phase;
  context.fillStyle = FX_COLORS.gazeWhite;
  for (let i = 0; i < RAYS; i++) {
    const angle = (i * Math.PI * 2) / RAYS + time * 0.01;
    const near = 6 + phase * RAY_REACH * 0.5;
    const far = 10 + phase * RAY_REACH;
    const at = (distance) => ({
      x: heart.x + Math.cos(angle) * distance,
      y: heart.y + Math.sin(angle) * distance,
    });
    fineLine(context, { from: at(near), to: at(far) });
  }
  context.globalAlpha = 1;
}

// the light behind him as he reforms
export function drawReformBacklight(context, { fighter, floor, phase }) {
  if (phase < 0) {
    return;
  }
  const heart = bodyPoint(fighter, CHEST);
  drawColumn(context, { heart, floor, fade: 1 - phase });
  drawRays(context, { heart, phase, time: fighter.moveTime });
}

export function gatherHeart(fighter, phase) {
  const low = bodyPoint(fighter, RUBBLE_HEART);
  const high = bodyPoint(fighter, CHEST);
  return { x: high.x, y: low.y + (high.y - low.y) * (phase + 1) ** 2 };
}

// the light over him: motes gathering to his heart, then a star flaring there
export function drawReformFlare(context, { fighter, phase }) {
  if (phase < 0) {
    const heart = gatherHeart(fighter, phase);
    drawGather(context, { heart, phase, time: fighter.moveTime });
    return;
  }
  const heart = bodyPoint(fighter, CHEST);
  drawHalo(context, { ...heart, radius: 8 * (1 - phase) + 2, strength: 2 - phase });
  drawStar(context, { ...heart, arm: Math.round(24 * (1 - phase)) + 3 });
}
