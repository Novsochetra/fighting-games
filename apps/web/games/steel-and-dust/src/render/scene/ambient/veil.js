import { VIEW_HEIGHT, VIEW_WIDTH } from '../../../config.js';
import { stormStrength } from './storm.js';

const STEP = 8;
const WAVE = 8;

function waveAt(column) {
  const swell = 0.6 * Math.sin(column * 0.47) + 0.4 * Math.sin(column * 0.19 + 2);
  return Math.round(((swell + 1) / 2) * WAVE);
}

// the dust bank's billowing top is keyed to whole columns so it rolls with the wind instead of
// shimmering; a stronger storm lifts it higher up the canyon
function drawDustBank(painter, { effect, tick, cameraX, strength }) {
  const bottom = effect.y + effect.height;
  const top = effect.y + Math.round(effect.height * 0.6 * (1 - strength));
  const offset = tick * (effect.wind ?? 0.6) + cameraX * (effect.drift ?? 0);
  const firstColumn = Math.floor(offset / STEP);
  const shift = offset - firstColumn * STEP;
  painter.alpha(0.05 + strength * 0.25);
  painter.rect(0, top + WAVE, VIEW_WIDTH, bottom - top - WAVE);
  for (let i = 0; i <= VIEW_WIDTH / STEP + 1; i++) {
    const wave = waveAt(firstColumn + i);
    if (wave < WAVE) {
      painter.rect(i * STEP - shift, top + wave, STEP, WAVE - wave);
    }
  }
}

// the whole canyon behind the fighters sinks into the dust as the storm thickens, then clears;
// squaring the strength keeps the canyon clear most of the time and saves the murk for the peaks
export function drawVeil(painter, { effect, tick, cameraX, colors }) {
  const strength = stormStrength(tick) ** 2;
  painter.use(colors.veil);
  painter.alpha(strength * (effect.thickness ?? 0.2)).rect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  drawDustBank(painter, { effect, tick, cameraX, strength });
  painter.alpha(1);
}
