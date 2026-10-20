import { VIEW_WIDTH } from '../../../config.js';
import { hashInt } from '../../../lib/math.js';
import { NEAR_WIDTH, batPose } from './bat-frames.js';
import { TAU, isOnScreen, trait } from './motion.js';

const SALT = 19000;
const SPEED = 1.1;
const SPAN = 100;
const EDGE = 12;
const SHORTEST_LOOP = VIEW_WIDTH + SPAN + EDGE * 2;

// the stream flies round a loop wider than the view, so it crosses once per period and the camera
// can slide it sideways without a bat ever popping in or out on screen
function streamAt({ effect, tick, cameraX }) {
  const loop = Math.max(effect.period * SPEED, SHORTEST_LOOP);
  const shift = cameraX * (effect.drift ?? 0);
  const travelled = tick * SPEED - shift;
  const crossing = Math.floor(travelled / loop);
  const seed = crossing + SALT;
  return {
    seed,
    shift,
    head: travelled - crossing * loop - EDGE,
    size: 5 + (hashInt(seed) % 5),
    y: effect.y + Math.round(trait(seed, 1) * 16) - 8,
    phase: trait(seed, 2) * TAU,
  };
}

// a bat darts: smooth swoops plus a sudden small hop every few ticks
function flutterOf(seed, tick) {
  const hop = trait(seed * 7 + Math.floor((tick + seed) / 9), 5) - 0.5;
  return Math.sin(tick * 0.29 + seed) * 1.2 + Math.sin(tick * 0.13 + seed * 2.9) * 1.6 + hop * 2;
}

function batAt(stream, i, tick) {
  const seed = stream.seed * 31 + i;
  const far = trait(seed, 3) < 0.35;
  const x = stream.head - ((i + trait(seed, 1) * 0.9) / stream.size) * SPAN;
  // bats follow the same wavy lane in the sky, so the stream reads as one ribbon
  const ribbon = Math.sin((x + stream.shift) * 0.028 + stream.phase) * 7;
  const lane = (trait(seed, 2) - 0.5) * (far ? 8 : 14);
  return {
    x: x + Math.sin(tick * 0.05 + i * 2.3) * 2,
    y: stream.y + lane + ribbon + flutterOf(seed, tick) - (far ? 4 : 0),
    far,
    beat: Math.floor((tick + Math.floor(trait(seed, 4) * 12)) / (far ? 4 : 3)),
  };
}

function drawBat(painter, bat) {
  const left = Math.round(bat.x);
  const top = Math.round(bat.y);
  painter.alpha(bat.far ? 0.75 : 1);
  for (const [offsetX, offsetY, width, height] of batPose(bat.far, bat.beat)) {
    painter.rect(left + offsetX, top + offsetY, width, height);
  }
}

export function drawBats(painter, { effect, tick, cameraX, colors }) {
  const stream = streamAt({ effect, tick, cameraX });
  painter.use(colors.bat);
  let drawn = false;
  for (let i = 0; i < stream.size; i++) {
    const bat = batAt(stream, i, tick);
    if (isOnScreen(bat.x, bat.y, NEAR_WIDTH)) {
      drawBat(painter, bat);
      drawn = true;
    }
  }
  if (drawn) {
    painter.alpha(1);
  }
}
