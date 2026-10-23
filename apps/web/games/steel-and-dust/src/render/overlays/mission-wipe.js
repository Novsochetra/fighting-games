import { COLORS } from '../../art/colors.js';
import { createPainter } from '../painter.js';
import { wipeCells } from './wipe-timing.js';

// each diamond burns at its edge, amber outside and butter inside its night; every cell's edge is
// drawn before any night, so an edge only shows where the night ends
const LAYERS = [
  { color: COLORS.amber, grow: 2 },
  { color: COLORS.butter, grow: 1 },
  { color: COLORS.night, grow: 0 },
];

// a wipe frame stamps hundreds of diamonds, so each size is drawn once and kept
function diamondSprite(view, color, radius) {
  const key = `${color}:${radius}`;
  if (!view.diamonds.has(key)) {
    const canvas = view.loaders.createCanvas(radius * 2 + 1, radius * 2 + 1);
    createPainter(canvas.getContext('2d')).use(color).diamond(radius, radius, radius);
    view.diamonds.set(key, canvas);
  }
  return view.diamonds.get(key);
}

export function drawMissionWipe(painter, view, wipe) {
  const cells = wipeCells(wipe);
  for (const { color, grow } of LAYERS) {
    for (const { x, y, radius } of cells) {
      const size = radius + grow;
      painter.context.drawImage(diamondSprite(view, color, size), x - size, y - size);
    }
  }
}
