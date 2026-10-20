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
  mirage: { kind: 'mirage', plane: 'back', y: 112, height: 14, drift: 0.08 },
  flames: {
    kind: 'flames',
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
