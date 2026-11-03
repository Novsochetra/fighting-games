import { VIEW } from '../../config.js';
import { EFFECT_COLOURS } from '../../art/actors.js';
import { LIFETIMES } from './effect-list.js';

// the flash is timed by the match's ticks, and a story scene (effects `held`) holds them at the
// goal's first: it waits under the scene, unseen, and plays once the match goes on
export function drawFlash(context, effects, tick) {
  const flash = effects?.held ? null : effects?.flash;
  const age = flash ? tick - flash.born : Infinity;

  if (age < 0 || age >= LIFETIMES.flash) {
    return;
  }

  context.globalAlpha = 0.6 * (1 - age / LIFETIMES.flash) ** 2;
  context.fillStyle = EFFECT_COLOURS.flash;
  context.fillRect(0, 0, VIEW.width, VIEW.height);
  context.globalAlpha = 1;
}
