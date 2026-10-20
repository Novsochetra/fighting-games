import { VIEW_WIDTH } from '../../../config.js';
import { trait } from './motion.js';

const SALT = 19000;
// how bright a strike is on each tick after it starts: the flash, a dip, then an afterflash
export const FLASH = [0.8, 1, 0.3, 0.05, 0.55, 0.7, 0.35, 0.15, 0.05];
// each layer spans the whole width, so the flash has no edges to give it away; stacked from the
// top they light the clouds most and fade toward the horizon
const LAYER_SHARES = [1, 0.8, 0.6, 0.4, 0.2];

// one strike in every period, at a moment picked by the period's hash
export function strikeAt(effect, tick) {
  const period = Math.floor(tick / effect.period);
  const start = Math.floor(trait(period + SALT, 1) * (effect.period - FLASH.length));
  const age = tick - period * effect.period - start;
  return age >= 0 && age < FLASH.length ? FLASH[age] : 0;
}

export function drawLightning(painter, { effect, tick, colors }) {
  const brightness = strikeAt(effect, tick);
  if (brightness <= 0) {
    return;
  }
  const span = effect.bottom - effect.top;
  painter.use(colors.lightning).alpha(effect.strength * brightness);
  for (const share of LAYER_SHARES) {
    painter.rect(0, effect.top, VIEW_WIDTH, Math.round(span * share));
  }
  painter.alpha(1);
}
