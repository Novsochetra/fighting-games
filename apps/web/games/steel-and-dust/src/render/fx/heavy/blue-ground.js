import { COLORS } from '../../../art/colors.js';
import { flicker } from '../fine-pixels.js';
import { drawnLeanX } from './blue-lean.js';

// the frost crystals that push up out of the rime round the feet: how far out, how tall, and which
// way their tips lean (away from the Shade)
const CRYSTALS = [
  [-13, 2, -1],
  [-9, 4, -1],
  [-5, 3, 0],
  [6, 3, 1],
  [10, 5, 1],
  [15, 2, 1],
];
const REACH = 16;

function spreadOf(move, time) {
  return Math.min(1, (time + 1) / Math.max(1, move.startup - 1));
}

// the rime sits under the drawn feet as they coil back, and stays there as the Shade dashes off
function stanceOf(fighter, time) {
  const coiled = Math.min(time, fighter.move.startup - 1);
  return { x: Math.round(fighter.x + drawnLeanX(fighter, coiled)), y: Math.round(fighter.y) };
}

function drawRime(painter, { stance, radius, art, tickCount }) {
  const { x, y } = stance;
  painter.use(art.rimeShade).rect(x - radius, y, radius * 2 + 1, 1);
  for (let dx = 2 - radius; dx < radius - 1; dx++) {
    if (flicker(dx + 40, 0) > 0.2) {
      const glint = flicker(dx, tickCount >> 2) > 0.88;
      painter.use(glint ? COLORS.white : art.rime).rect(x + dx, y - 1, 1, 1);
    }
  }
}

// a faceted crystal: a lit face and a shadowed one over a frosted foot, its white point leaning out
function drawCrystal(painter, { x, y, height, tip, art }) {
  const top = y - 1 - height;
  const shade = tip || 1;
  painter.use(art.rimeShade).rect(x - 1, y - 1, 3, 1);
  painter.use(art.ice).rect(x, top + 1, 1, height);
  painter.use(art.deep).rect(x + shade, top + 1 + (height >> 1), 1, height - (height >> 1));
  painter.use(COLORS.white).rect(x + (height > 3 ? tip : 0), top, 1, 1);
}

function drawCrystals(painter, { fighter, stance, radius, spread, art }) {
  const grown = Math.round(spread * 2) - 1;
  for (const [offset, tall, lean] of CRYSTALS) {
    if (Math.abs(offset) <= radius) {
      const x = stance.x + offset * fighter.facing;
      const height = Math.max(1, tall + grown);
      drawCrystal(painter, { x, y: stance.y, height, tip: lean * fighter.facing, art });
    }
  }
}

// frost spreads over the ground round the coiled Shade and crystals push up out of it; as it dashes
// they are gone (the kit throws them as shards) and the rime it leaves fades
export function blueUnder(painter, layer) {
  const { fighter, move, time, art, tickCount } = layer;
  if (fighter.airborne || time >= move.startup + 2) {
    return;
  }
  const spread = spreadOf(move, time);
  const ground = { fighter, stance: stanceOf(fighter, time), spread, art, tickCount };
  ground.radius = Math.round(4 + spread * (REACH - 4));
  painter.alpha(time >= move.startup ? 0.5 : 1);
  drawRime(painter, ground);
  if (time < move.startup) {
    drawCrystals(painter, ground);
  }
  painter.alpha(1);
}
