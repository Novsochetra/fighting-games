import { HEAVY_ART } from '../../art/heavy-fx/index.js';
import { HEAVY_FEEL } from '../../data/heavy-feel/index.js';
import { isHeavyMove } from '../../data/moves/heavy-moves.js';
import { HEAVY_RENDERS } from '../fx/heavy/index.js';

// the glow flares hot just before the strike and holds a few ticks past it, as the power leaves
const HOT_LEAD = 2;
const STRIKE_GLOW = 2;

function inHeavy(fighter) {
  return fighter.state === 'attack' && isHeavyMove(fighter.move);
}

// a heavy winds up in the Shade's glow: dim as it starts, full as it gathers, hot as it strikes
export function heavyGlowColor(fighter, heroId) {
  const art = HEAVY_ART[heroId];
  if (!art || !inHeavy(fighter)) {
    return null;
  }
  const { startup } = fighter.move;
  const time = fighter.moveTime;
  if (time >= startup + STRIKE_GLOW) {
    return null;
  }
  if (time >= startup - HOT_LEAD) {
    return art.hot;
  }
  return time * 2 < startup ? art.glowDim : art.glow;
}

// the sprite draws back as a heavy winds up and snaps forward as it strikes; only the drawing moves,
// so the heavy reaches as far as ever
export function heavyLeanX(fighter, heroId) {
  const feel = HEAVY_FEEL[heroId];
  if (!feel || !inHeavy(fighter) || fighter.moveTime >= fighter.move.startup) {
    return 0;
  }
  const share = Math.min(1, (fighter.moveTime + 1) / feel.leanTicks);
  return -fighter.facing * Math.round(feel.lean * share);
}

// what a Shade draws under or over itself while a heavy plays (render/fx/heavy/<shade>.js)
export function drawHeavyLayer(painter, layer, { fighter, heroId, tickCount }) {
  const draw = HEAVY_RENDERS[heroId]?.[layer];
  if (!draw || !inHeavy(fighter)) {
    return;
  }
  const art = HEAVY_ART[heroId];
  draw(painter, { fighter, move: fighter.move, time: fighter.moveTime, art, tickCount });
}
