import { VIEW_WIDTH } from '../../../config.js';

const BANDS = 3;
const STEP = 8;
const WAVE = 6;

function waveAt(column, band) {
  const swell = 0.6 * Math.sin(column * 0.55 + band * 2.1) + 0.4 * Math.sin(column * 0.21 + band);
  return Math.round(((swell + 1) / 2) * WAVE);
}

// the stepped top edge is keyed to whole columns so it slides with the mist instead of shimmering
function drawBand(painter, { band, effect, tick, cameraX }) {
  const bottom = effect.y + effect.height;
  const rise = (band * effect.height) / (BANDS + 1) + Math.sin(tick * 0.01 + band) * 2;
  const top = effect.y + Math.round(rise);
  const offset = tick * (0.05 + band * 0.04) + cameraX * (effect.drift ?? 0);
  const firstColumn = Math.floor(offset / STEP);
  const shift = offset - firstColumn * STEP;
  painter.alpha(0.1 + band * 0.04);
  if (bottom > top + WAVE) {
    painter.rect(0, top + WAVE, VIEW_WIDTH, bottom - top - WAVE);
  }
  for (let i = 0; i <= VIEW_WIDTH / STEP; i++) {
    const wave = waveAt(firstColumn + i, band);
    if (wave < WAVE) {
      painter.rect(i * STEP - shift, top + wave, STEP, WAVE - wave);
    }
  }
}

export function drawMist(painter, { effect, tick, cameraX, colors }) {
  painter.use(colors.mist);
  for (let band = 0; band < BANDS; band++) {
    drawBand(painter, { band, effect, tick, cameraX });
  }
  painter.alpha(1);
}
