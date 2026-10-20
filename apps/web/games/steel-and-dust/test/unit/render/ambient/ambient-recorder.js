import { PAINTED_THEMES } from '../../../../src/art/painted-themes/index.js';
import { createPainter } from '../../../../src/render/painter.js';
import { drawAmbient } from '../../../../src/render/scene/ambient/index.js';
import { createRecordingContext } from '../../../support/recording-canvas.js';

export const ALL_COLORS = Object.assign(
  {},
  ...Object.values(PAINTED_THEMES).map((theme) => theme.ambient),
);

export const SAMPLE_EFFECTS = {
  mist: { kind: 'mist', plane: 'back', y: 120, height: 56, drift: 0.3 },
  birds: { kind: 'birds', plane: 'back', period: 900, y: 40 },
  leaves: { kind: 'leaves', plane: 'front', count: 24, drift: 1.2, wind: 0.15 },
  motes: { kind: 'motes', plane: 'back', count: 30, drift: 0.6, top: 60, bottom: 180 },
  shafts: {
    kind: 'shafts',
    plane: 'back',
    shafts: [
      { x: 60, width: 26 },
      { x: 250, width: 40 },
    ],
    slope: 0.35,
    drift: 0.2,
  },
  fireflies: { kind: 'fireflies', plane: 'front', count: 14, drift: 0.9, top: 90, bottom: 180 },
  embers: {
    kind: 'embers',
    plane: 'back',
    emitters: [
      { x: 120, y: 170 },
      { x: 420, y: 168 },
    ],
    tileWidth: 640,
    drift: 0.8,
  },
  smoke: {
    kind: 'smoke',
    plane: 'back',
    emitters: [
      { x: 120, y: 170 },
      { x: 420, y: 168 },
    ],
    tileWidth: 640,
    drift: 0.8,
  },
  gusts: {
    kind: 'gusts',
    plane: 'front',
    count: 30,
    speed: 5,
    length: 30,
    top: 40,
    bottom: 200,
    drift: 1.3,
    alpha: 0.8,
  },
  veil: { kind: 'veil', plane: 'back', y: 130, height: 54, wind: 0.7, drift: 0.3, thickness: 0.3 },
  plumes: { kind: 'plumes', plane: 'back', count: 8, y: 186, speed: 0.9, drift: 0.7 },
  devil: { kind: 'devil', plane: 'back', period: 1200, x: 200, y: 158, height: 46, drift: 0.12 },
  vultures: {
    kind: 'vultures',
    plane: 'back',
    count: 3,
    x: 190,
    y: 46,
    radius: 26,
    turn: 0.011,
    drift: 0.1,
  },
  tumbleweeds: {
    kind: 'tumbleweeds',
    plane: 'front',
    count: 3,
    speed: 1.4,
    y: 213,
    drift: 1.25,
    often: 1,
  },
  glow: {
    kind: 'glow',
    plane: 'back',
    emitters: [
      { x: 120, y: 150 },
      { x: 420, y: 160 },
    ],
    tileWidth: 640,
    drift: 0.8,
    width: 60,
    height: 44,
  },
  sparks: {
    kind: 'sparks',
    plane: 'back',
    emitters: [
      { x: 120, y: 120 },
      { x: 420, y: 100 },
    ],
    tileWidth: 640,
    drift: 0.8,
    period: 120,
    burst: 50,
    count: 16,
  },
  plume: {
    kind: 'plume',
    plane: 'back',
    emitters: [{ x: 120, y: 90 }],
    tileWidth: 640,
    drift: 0.8,
    rise: 0.22,
    wind: 0.1,
    size: 26,
  },
  steam: {
    kind: 'steam',
    plane: 'back',
    emitters: [
      { x: 120, y: 140 },
      { x: 420, y: 150 },
    ],
    tileWidth: 640,
    drift: 0.8,
    period: 150,
    burst: 60,
    toward: [0.2, -1],
  },
  shimmer: {
    kind: 'shimmer',
    plane: 'back',
    emitters: [{ x: 120, y: 170 }],
    tileWidth: 640,
    drift: 0.8,
    width: 40,
    height: 28,
  },
  ash: { kind: 'ash', plane: 'front', count: 30, drift: 0.9, wind: 0.1 },
  flames: {
    kind: 'flames',
    plane: 'back',
    size: 10,
    emitters: [
      { x: 120, y: 150 },
      { x: 420, y: 140 },
    ],
    tileWidth: 640,
    drift: 0.8,
  },
  // a period whose strike is lit at the busy tick the shared checks draw
  lightning: { kind: 'lightning', plane: 'back', period: 770, top: 0, bottom: 150, strength: 0.3 },
  pennants: {
    kind: 'pennants',
    plane: 'back',
    length: 48,
    height: 12,
    flutter: 3,
    droop: 4,
    emitters: [
      { x: 150, y: 60 },
      { x: 500, y: 50 },
    ],
    tileWidth: 640,
    drift: 0.6,
  },
  mirage: { kind: 'mirage', plane: 'back', y: 112, height: 14, drift: 0.08 },
  braziers: {
    kind: 'braziers',
    plane: 'back',
    emitters: [
      { x: 120, y: 150 },
      { x: 420, y: 148 },
    ],
    tileWidth: 640,
    drift: 0.8,
  },
  trickle: {
    kind: 'trickle',
    plane: 'back',
    emitters: [
      { x: 120, y: 60, fall: 100 },
      { x: 420, y: 130, fall: 30 },
    ],
    tileWidth: 640,
    drift: 0.8,
  },
  bats: { kind: 'bats', plane: 'back', period: 900, y: 40 },
  sandDrift: {
    kind: 'sandDrift',
    plane: 'front',
    count: 16,
    drift: 1.15,
    wind: 0.45,
    top: 188,
    bottom: 212,
  },
  glints: { kind: 'glints', plane: 'back', count: 40, top: 130, bottom: 170, drift: 0.08 },
  butterflies: { kind: 'butterflies', plane: 'front', count: 6, top: 110, bottom: 180, drift: 1.1 },
};

export function recordAmbient(effects, options = {}) {
  const { plane = 'back', tick = 0, cameraX = 0, colors = ALL_COLORS } = options;
  const { context, log } = createRecordingContext(null);
  drawAmbient(createPainter(context), { effects, plane, tick, cameraX, colors });
  return { log, alpha: context.globalAlpha };
}

export function recordEffect(effect, options = {}) {
  return recordAmbient([effect], { plane: effect.plane, ...options });
}

// every fillRect with the color and alpha in force when it was drawn
export function drawnRects(log) {
  const rects = [];
  let color = null;
  let alpha = 1;
  for (const entry of log) {
    if (entry.startsWith('fillStyle=')) {
      color = entry.slice('fillStyle='.length);
    } else if (entry.startsWith('globalAlpha=')) {
      alpha = Number(entry.slice('globalAlpha='.length));
    } else if (entry.startsWith('fillRect(')) {
      const [x, y, width, height] = entry.slice('fillRect('.length, -1).split(',').map(Number);
      rects.push({ x, y, width, height, color, alpha });
    }
  }
  return rects;
}

export function rectsOf(effect, options) {
  return drawnRects(recordEffect(effect, options).log);
}

export function ticksUpTo(lastTick, step) {
  return Array.from({ length: Math.floor(lastTick / step) + 1 }, (_, i) => i * step);
}
