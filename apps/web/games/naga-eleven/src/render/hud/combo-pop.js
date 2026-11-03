import { EFFECT_TICKS } from '../../data/move-effects.js';
import { PASS_COMBO } from '../../data/combos.js';
import { HUD } from '../../art/hud.js';
import { looksOf } from '../actors/looks.js';
import { placeClear } from './clear-place.js';
import { drawLevel, levelWidth } from './pixel-digits.js';
import { headOf } from './skill-popup.js';

// the passer's new level rises off his head, by it so as not to cover his name, and fades
const POP = { rise: 12, fadeFrom: 20, aside: 7, grow: 5 };

export function drawComboPops(context, effects, { match, camera, standHeight }) {
  const { kits } = looksOf(match);

  for (const pop of effects?.pops ?? []) {
    const age = match.tick - pop.born;
    const player = match.players[pop.player];

    if (age >= 0 && age < EFFECT_TICKS.comboPop && player) {
      const head = headOf(camera, { match, player, standHeight });
      const cell = age < POP.grow ? 3 : 2;
      const height = 7 * cell;
      const spot = placeClear(match, {
        x: head.x + POP.aside,
        y: head.y - (age / EFFECT_TICKS.comboPop) * POP.rise - height,
        width: levelWidth(cell),
        height,
      });
      const ramp = pop.level >= PASS_COMBO.finisherFrom ? HUD.gold : kits[pop.team].outfield.shirt;

      context.globalAlpha =
        age < POP.fadeFrom ? 1 : 1 - (age - POP.fadeFrom) / (EFFECT_TICKS.comboPop - POP.fadeFrom);
      drawLevel(context, { level: pop.level, x: spot.x, bottom: spot.y + height, cell, ramp });
      context.globalAlpha = 1;
    }
  }
}
