import { drawStamped } from '../stamps.js';

// [radius past the sun's own, which color, alpha at the low of a breath, extra at the high]; the
// halos stack, so the light steps up toward the sun the pixel-art way
const HALOS = [
  [30, 2, 0.02, 0.03],
  [20, 2, 0.025, 0.035],
  [12, 1, 0.03, 0.04],
  [6, 1, 0.035, 0.05],
  [2, 0, 0.04, 0.06],
];
const BREATH_RATE = 0.011;

// the low sun breathes in and out over about ten seconds
export function sunBreath(tick) {
  return 0.5 - 0.5 * Math.cos(tick * BREATH_RATE);
}

// a disc of 1px rows, drawn from its top-left corner
function drawDiscRows(context, left, top, radius) {
  for (let dy = -radius; dy <= radius; dy++) {
    const half = Math.round(Math.sqrt(radius * radius - dy * dy));
    context.fillRect(left + radius - half, top + radius + dy, half * 2 + 1, 1);
  }
}

// the rows never overlap, so one stamp laid down at the halo's alpha lights the sky as they did
function drawDisc(painter, { x, y, radius }) {
  drawStamped(painter, {
    key: `disc|${radius}|${painter.color}`,
    x: Math.round(x) - radius,
    y: Math.round(y) - radius,
    width: radius * 2 + 1,
    height: radius * 2 + 1,
    draw: (context, left, top) => {
      context.fillStyle = painter.color;
      drawDiscRows(context, left, top, radius);
    },
  });
}

// light adds to the sky under it rather than covering it, so the clouds and palms keep their shapes
export function drawSunGlow(painter, { effect, tick, colors }) {
  const breath = sunBreath(tick);
  const swell = Math.round(breath * 2);
  painter.context.globalCompositeOperation = 'lighter';
  for (const [extra, colorIndex, base, rise] of HALOS) {
    painter.use(colors.sun[colorIndex]).alpha(base + rise * breath);
    drawDisc(painter, { x: effect.x, y: effect.y, radius: effect.radius + extra + swell });
  }
  painter.context.globalCompositeOperation = 'source-over';
  painter.alpha(1);
}
