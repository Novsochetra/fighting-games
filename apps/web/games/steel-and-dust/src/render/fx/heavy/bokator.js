import { BOKATOR_HEAVY_FEEL } from '../../../data/heavy-feel/bokator.js';
import { chestOf } from '../../../sim/fx/heavy/default-kit.js';
import { BOKATOR_PARTICLE_DRAWS } from './bokator-particles.js';

// the breath held in his chest flares in the last ticks before the blow, over the lean the sprite
// is drawn with (heavy-glow.js) so it stays on his body
const STAR_TICKS = 3;

function leanOf(fighter, time) {
  const { lean, leanTicks } = BOKATOR_HEAVY_FEEL;
  return -fighter.facing * Math.round(lean * Math.min(1, (time + 1) / leanTicks));
}

function drawChestStar(painter, { fighter, move, time, art }) {
  const lead = move.startup - time;
  if (lead > STAR_TICKS || lead < 1) {
    return;
  }
  const arm = STAR_TICKS + 1 - lead;
  const chest = chestOf(fighter);
  const x = Math.round(chest.x + leanOf(fighter, time));
  const y = Math.round(chest.y);
  painter
    .use(art.trail)
    .rect(x - arm, y, arm * 2 + 1, 1)
    .rect(x, y - arm, 1, arm * 2 + 1);
  painter
    .use(art.hot)
    .rect(x - 1, y, 3, 1)
    .rect(x, y - 1, 1, 3);
  painter.use(art.core).rect(x, y, 1, 1);
}

// what the Bokator's heavies draw beyond what every Shade's share: particle kinds of its own, and
// the chest star over the hero; the flame behind him is his ultimate's strip, played by the kit
export const BOKATOR_HEAVY_RENDER = {
  particles: BOKATOR_PARTICLE_DRAWS,
  under: null,
  over: drawChestStar,
};
