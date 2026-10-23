import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { PIXEL, flicker, inLight, snap } from '../fx/fine-pixels.js';
import { drawEnemyFrame } from './enemy-sprites.js';

// a boss that has reformed glows: a gold rim one screen pixel round its sprite and a faint ember
// halo one further out, breathing in steps rather than fading smoothly
const RIM_LEVELS = [0.4, 0.5, 0.62, 0.78, 0.62, 0.5];
const RIM_STEP_TICKS = 8;
const RIM = [
  [-PIXEL, 0],
  [PIXEL, 0],
  [0, -PIXEL],
  [-PIXEL, -PIXEL],
  [PIXEL, -PIXEL],
];
const HALO = [
  [-PIXEL * 2, 0],
  [PIXEL * 2, 0],
  [0, -PIXEL * 2],
];
// motes of gold rise off his stone, each from a new place on his body every life
const MOTES = 9;
const MOTE_LIFE = 72;
const MOTE_RISE = 0.4;
const MOTE_FADE_IN = 8;

export const rimAlpha = (tick) => RIM_LEVELS[Math.floor(tick / RIM_STEP_TICKS) % RIM_LEVELS.length];

function drawCopies(painter, sheets, { at, offsets, tint }) {
  for (const [dx, dy] of offsets) {
    drawEnemyFrame(painter, sheets, { ...at, x: at.x + dx, y: at.y + dy, tint });
  }
}

export function drawReformedRim(painter, sheets, { at, tickCount }) {
  const alpha = rimAlpha(tickCount);
  inLight(painter.context, () => {
    painter.alpha(alpha * 0.45);
    drawCopies(painter, sheets, { at, offsets: HALO, tint: FX_COLORS.gazeEmber });
  });
  painter.alpha(alpha);
  drawCopies(painter, sheets, { at, offsets: RIM, tint: FX_COLORS.guardianGlow });
  painter.alpha(1);
}

const fadeOf = (age) => Math.ceil(Math.min(age / MOTE_FADE_IN, 1 - age / MOTE_LIFE) * 4) / 4;

// where each mote is: risen from a spot on his body (`hurtShape`, in his own units) and swaying
export function glowMotes(fighter, tick) {
  const [behind, top, width, height] = fighter.def.hurtShape;
  const scale = fighter.scale;
  return Array.from({ length: MOTES }, (_, i) => {
    const life = tick + (i * MOTE_LIFE) / MOTES;
    const age = life % MOTE_LIFE;
    const cycle = Math.floor(life / MOTE_LIFE);
    const ahead = (flicker(i, cycle) * width - behind) * scale * fighter.facing;
    const up = (top - height + flicker(i + MOTES, cycle) * height * 0.8) * scale;
    return {
      x: fighter.x + ahead + Math.sin((age + i * 9) * 0.12) * 1.5,
      y: fighter.y - up - age * MOTE_RISE,
      alpha: fadeOf(age),
      hot: (age >> 2) % 3 === 0,
    };
  });
}

// each mote is a small cross of gold over a pale heart, white-hot every so often, with an ember
// left glowing under it as it rises
function drawMote(context, mote) {
  const x = snap(mote.x);
  const y = snap(mote.y);
  context.globalAlpha = mote.alpha * 0.6;
  context.fillStyle = FX_COLORS.gazeEmber;
  context.fillRect(x, y + PIXEL * 2, PIXEL, PIXEL);
  context.globalAlpha = mote.alpha;
  context.fillStyle = FX_COLORS.guardianGlow;
  context.fillRect(x - PIXEL, y, PIXEL * 3, PIXEL);
  context.fillRect(x, y - PIXEL, PIXEL, PIXEL * 3);
  context.fillStyle = mote.hot ? COLORS.white : FX_COLORS.gazeWhite;
  context.fillRect(x, y, PIXEL, PIXEL);
}

export function drawGlowMotes(context, fighter, tickCount) {
  inLight(context, () => {
    for (const mote of glowMotes(fighter, tickCount)) {
      drawMote(context, mote);
    }
  });
  context.globalAlpha = 1;
}
