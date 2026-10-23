import { drawFootfall, isStomping } from './footfall.js';
import { drawGlowMotes, drawReformedRim } from './reformed-glow.js';
import { drawReformBacklight, drawReformFlare, reformPhase } from './reform-light.js';

// what the Bayon Guardian's stone throws off behind his sprite: the dust of his footfalls, the
// light bursting out as he reforms and, once reformed, his gold rim
export function drawGuardianBehind(painter, sheets, { fighter, at, floor, tickCount }) {
  if (isStomping(fighter)) {
    drawFootfall(painter.context, { fighter, floor });
  }
  const phase = reformPhase(fighter);
  if (phase !== null) {
    drawReformBacklight(painter.context, { fighter, floor, phase });
  }
  if (fighter.glowing) {
    drawReformedRim(painter, sheets, { at, tickCount });
  }
}

// and over it: the light gathering to his heart and flaring as he reforms, and the gold motes
// rising off him once he has
export function drawGuardianOver(painter, { fighter, tickCount }) {
  const phase = reformPhase(fighter);
  if (phase !== null) {
    drawReformFlare(painter.context, { fighter, phase });
  }
  if (fighter.glowing) {
    drawGlowMotes(painter.context, fighter, tickCount);
  }
}
