import { COLORS } from '../../../art/colors.js';
import { strikeLineOf } from '../../../sim/fx/heavy/blue-strike.js';
import { slashArc } from '../slash-arc.js';
import { drawnLeanX } from './blue-lean.js';

const FLASH_TICKS = 2;
const GLINT_LEAD = 3;

// the hilt held at the front of the coiled body, on the drawn sprite
function hiltOf(fighter, time) {
  const x = fighter.x + drawnLeanX(fighter, time) + fighter.facing * 6;
  return { x: Math.round(x), y: Math.round(fighter.y - 19) };
}

// the hilt winks, brighter each tick, just before the draw
function drawGlint(painter, { fighter, move, time }) {
  const arm = time - (move.startup - GLINT_LEAD) + 1;
  const { x, y } = hiltOf(fighter, time);
  painter
    .use(COLORS.white)
    .rect(x - arm - 1, y, arm * 2 + 3, 1)
    .rect(x, y - arm, 1, arm * 2 + 1);
}

// the draw itself: one cold slash through the air ahead, pointed at both ends, thick and white as it
// opens and a white hair the tick after; a blow's hitstop holds the move's clock, and the flash
// must not hang there
function drawFlash(painter, { fighter, move, time, art }) {
  const age = time - move.startup;
  if (age > 0 && fighter.hitstop > 0) {
    return;
  }
  const slash = { ...strikeLineOf(fighter, move), bend: 0.04 * fighter.facing };
  if (age === 0) {
    slashArc(painter, { ...slash, width: 4, color: art.deep });
    slashArc(painter, { ...slash, width: 2, color: COLORS.white });
    return;
  }
  slashArc(painter, { ...slash, width: 2, color: art.flash });
}

// over the Shade: the hilt's wink as it coils, then the one cold line of the draw
export function blueOver(painter, layer) {
  const { move, time } = layer;
  if (time >= move.startup - GLINT_LEAD && time < move.startup) {
    drawGlint(painter, layer);
  }
  if (time >= move.startup && time < move.startup + FLASH_TICKS) {
    drawFlash(painter, layer);
  }
}
