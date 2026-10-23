import { ANTLER_HEAVY_ART as ART } from '../../../art/heavy-fx/antler.js';
import { PIXEL, fineLine, flicker, snap } from '../fine-pixels.js';
import { antlerRoot } from './antler-head.js';

// one spirit antler seen from the side, sweeping back and up from the hood, in world pixels facing
// right: [fromX, fromY, toX, toY, width in screen pixels, share of the wind-up it shows at], each
// length of the beam growing in with the tine off it
const ANTLER = [
  [0, 0, -2, -4, 2, 0],
  [-1, -2, 2, -4, 1, 0.1],
  [2, -4, 3, -6, 1, 0.15],
  [-2, -4, -4, -8, 2, 0.2],
  [-3, -6, 0, -9, 1, 0.35],
  [-4, -8, -5, -12, 2, 0.4],
  [-4, -10, -1, -13, 1, 0.55],
  [-5, -12, -4, -15, 2, 0.6],
  [-5, -13, -8, -15, 1, 0.7],
  [-4, -15, -2, -18, 1, 0.8],
  [-4, -15, -6, -18, 1, 0.85],
];
// the far antler stands a little ahead of the near one, the way a head seen from the side shows both
const FAR_X = 2;
const FLICKER_GAP = 0.12;
// it rears its rack back as it gathers, then swings it down and on like a ram as it strikes, or
// for a launcher straightens it and thrusts it up
const REAR = -0.3;
const RAM = 1.2;
const RAM_TICKS = 4;
const THRUST = 5;

const growthOf = (time, startup) => Math.min(1, (time + 1) / Math.max(1, startup - 1));

function placer({ root, facing, angle }) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return (dx, dy) => ({
    x: root.x + (dx * cos - dy * sin) * facing,
    y: root.y + dx * sin + dy * cos,
  });
}

// a ghost's antlers flicker: now and then a tine drops out for a beat
function shownTines({ growth, beat, seed }) {
  return ANTLER.filter(
    ([, , , , , shows], i) => growth >= shows && (i < 2 || flicker(seed + i, beat) >= FLICKER_GAP),
  );
}

function drawAntler(context, { place, tines, color }) {
  for (const [edge, extra] of [
    [ART.edge, 2],
    [color, 0],
  ]) {
    context.fillStyle = edge;
    for (const [fromX, fromY, toX, toY, width] of tines) {
      fineLine(context, { from: place(fromX, fromY), to: place(toX, toY), width: width + extra });
    }
  }
}

function drawTips(context, { place, tines, beat }) {
  context.fillStyle = ART.antlerTip;
  for (const [, , toX, toY, width] of tines) {
    if (width === 1) {
      const tip = place(toX, toY);
      const rise = flicker(toX * 13 + toY, beat) < 0.5 ? PIXEL : 0;
      context.fillRect(snap(tip.x), snap(tip.y) - rise, PIXEL, PIXEL);
    }
  }
}

function crownPose(time, move) {
  const since = time - move.startup;
  if (since < 0) {
    const growth = growthOf(time, move.startup);
    return { growth, angle: REAR * growth, lift: 0, alpha: 1, hot: since >= -2 };
  }
  const swing = Math.min(1, (since + 1) / 2);
  const angle = move.launch ? REAR * (1 - swing) : REAR + (RAM - REAR) * swing;
  const lift = move.launch ? THRUST * swing : 0;
  return { growth: 1, angle, lift, alpha: 1 - since / RAM_TICKS, hot: true };
}

// spirit antlers grow tine by tine as it winds up and rears, then ram down and on as it strikes
export function drawCrown(context, { fighter, move, time, tickCount }) {
  if (time >= move.startup + RAM_TICKS) {
    return;
  }
  const pose = crownPose(time, move);
  const head = antlerRoot(fighter, time, move.startup);
  const root = { x: head.x, y: head.y - pose.lift };
  const beat = tickCount >> 1;
  const { facing } = fighter;
  const far = { x: root.x + FAR_X * facing, y: root.y };
  context.globalAlpha = 0.8 * pose.alpha;
  const farPlace = placer({ root: far, facing, angle: pose.angle });
  const farTines = shownTines({ growth: pose.growth, beat, seed: 31 });
  drawAntler(context, {
    place: farPlace,
    tines: farTines,
    color: pose.hot ? ART.antler : ART.antlerFar,
  });
  context.globalAlpha = pose.alpha;
  const place = placer({ root, facing, angle: pose.angle });
  const tines = shownTines({ growth: pose.growth, beat, seed: 7 });
  drawAntler(context, { place, tines, color: pose.hot ? ART.hot : ART.antler });
  drawTips(context, { place, tines, beat });
  context.globalAlpha = 1;
}
