// [angle from straight up, half its width, both in radians]; they fan up from the low sun
const RAYS = [
  [-1.05, 0.05],
  [-0.62, 0.08],
  [-0.2, 0.05],
  [0.28, 0.07],
  [0.78, 0.05],
];
const SWAY = 0.03;
const SWAY_RATE = 0.004;
const BREATH_RATE = 0.009;
// a ray fades in steps as it reaches up, the pixel-art way
const FADE_ROWS = 10;
const FADE_STEP = 0.75;

// each ray brightens and dims on its own slow beat while the whole fan leans a little to and fro
export function rayLight(index, tick) {
  return 0.5 + 0.5 * Math.sin(tick * BREATH_RATE + index * 2.4);
}

function drawRay(painter, { sun, angle, halfWidth, strength }) {
  const left = Math.tan(angle - halfWidth);
  const right = Math.tan(angle + halfWidth);
  for (let rise = sun.radius; rise <= sun.y; rise++) {
    if (rise % FADE_ROWS === 0) {
      painter.alpha(strength * FADE_STEP ** (rise / FADE_ROWS));
    }
    const from = Math.round(sun.x + rise * left);
    const width = Math.round(sun.x + rise * right) - from + 1;
    painter.rect(from, sun.y - rise, width, 1);
  }
}

export function drawSunRays(painter, { effect, tick, colors }) {
  const lean = Math.sin(tick * SWAY_RATE) * SWAY;
  painter.use(colors.ray);
  painter.context.globalCompositeOperation = 'lighter';
  RAYS.forEach(([angle, halfWidth], index) => {
    const strength = effect.alpha * (0.4 + 0.6 * rayLight(index, tick));
    painter.alpha(strength);
    drawRay(painter, { sun: effect, angle: angle + lean, halfWidth, strength });
  });
  painter.context.globalCompositeOperation = 'source-over';
  painter.alpha(1);
}
