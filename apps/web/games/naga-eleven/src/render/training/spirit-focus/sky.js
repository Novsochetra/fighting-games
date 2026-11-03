import { DAWN, PALM, RUIN, STARS, SUN } from '../../../art/training/temple.js';
import { ART_VIEW, dither, faded, noise, oval, paint } from '../pixels.js';

export const HORIZON = 124;
const BAND = 12;
const SUN_PLACE = { x: 192, y: 98 };

function drawBands(context) {
  DAWN.forEach((color, i) => {
    paint(context, color, [0, i * BAND, ART_VIEW.width, i === DAWN.length - 1 ? 40 : BAND]);

    if (i > 0) {
      dither(context, color, [0, i * BAND - 2, ART_VIEW.width, 2], i);
    }
  });
}

// the last stars, fading as the light comes
function drawStars(context, tick) {
  for (let i = 0; i < 26; i += 1) {
    const twinkle = (Math.floor(tick / 20) + i) % 7 === 0;

    faded(context, twinkle ? 0.4 : 0.9 - noise(i + 50) * 0.5, () =>
      paint(context, STARS[i % 2], [
        Math.floor(noise(i) * ART_VIEW.width),
        Math.floor(noise(i + 9) * 44),
        1,
        1,
      ]),
    );
  }
}

function drawSun(context) {
  faded(context, 0.25, () => oval(context, SUN.glow, { ...SUN_PLACE, radiusX: 46 }));
  faded(context, 0.35, () => oval(context, SUN.rim, { ...SUN_PLACE, radiusX: 32 }));
  oval(context, SUN.rim, { ...SUN_PLACE, radiusX: 22 });
  oval(context, SUN.mid, { ...SUN_PLACE, radiusX: 20 });
  oval(context, SUN.core, { x: SUN_PLACE.x - 3, y: SUN_PLACE.y - 3, radiusX: 14 });
}

// long thin clouds lit from below by the sun still under the horizon
function drawStreaks(context, tick) {
  const drift = Math.floor(tick / 30);

  for (let i = 0; i < 5; i += 1) {
    const width = 40 + Math.floor(noise(i + 20) * 60);
    const x = ((Math.floor(noise(i + 30) * 420) + drift) % 460) - 60;
    const y = 52 + i * 11;

    paint(context, DAWN[5 + (i % 3)], [x, y, width, 2]);
    paint(context, SUN.rim, [x + 6, y + 2, width - 12, 1]);
  }
}

// a tower of stepped tiers narrowing to a lotus bud
function drawTower(context, { x, base, height, width }) {
  const tiers = 6;

  for (let i = 0; i < tiers; i += 1) {
    const tierWidth = Math.round(width * (1 - i / (tiers + 1)));
    const top = base - Math.round((height * (i + 1)) / tiers);

    paint(context, RUIN.far, [x - tierWidth / 2, top, tierWidth, Math.ceil(height / tiers) + 1]);
    paint(context, RUIN.rim, [x - tierWidth / 2, top, tierWidth, 1]);
  }

  paint(context, RUIN.far, [x - 1, base - height - 5, 3, 5]);
}

// the temple's five towers against the sun, its long gallery under them
function drawTemple(context) {
  const base = HORIZON;

  paint(context, RUIN.far, [96, base - 14, 192, 14]);
  paint(context, RUIN.rim, [96, base - 14, 192, 1]);

  for (const tower of [
    { x: 122, height: 30, width: 18 },
    { x: 262, height: 30, width: 18 },
    { x: 152, height: 40, width: 22 },
    { x: 232, height: 40, width: 22 },
    { x: 192, height: 58, width: 28 },
  ]) {
    drawTower(context, { ...tower, base: base - 12 });
  }
}

function drawPalm(context, { x, height }) {
  const top = HORIZON - height;

  paint(context, PALM.trunk, [x, top, 2, height]);

  for (let i = -3; i <= 3; i += 1) {
    paint(context, PALM.leaf, [x + i * 3 - 1, top - 3 + Math.abs(i), 4, 2]);
    paint(context, PALM.leaf, [x + i * 4, top + Math.abs(i) * 2 - 2, 2, 2]);
  }

  oval(context, PALM.leaf, { x: x + 1, y: top - 2, radiusX: 6, radiusY: 3 });
}

export function drawDawn(context, { tick }) {
  drawBands(context);
  drawStars(context, tick);
  drawSun(context);
  drawStreaks(context, tick);
  drawTemple(context);
  paint(context, RUIN.near, [0, HORIZON - 4, ART_VIEW.width, 16]);

  for (const palm of [
    { x: 30, height: 44 },
    { x: 58, height: 34 },
    { x: 330, height: 40 },
    { x: 356, height: 50 },
  ]) {
    drawPalm(context, palm);
  }
}
