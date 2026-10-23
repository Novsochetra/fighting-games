import { BLUE_HEAVY_FEEL } from '../../../data/heavy-feel/blue.js';

// how far the drawn sprite sits back from the fighter as it coils (the same lean heavy-glow.js
// draws), so frost laid on the sprite lands on it and not in the air beside it
export function drawnLeanX(fighter, time) {
  if (time >= fighter.move.startup) {
    return 0;
  }
  const { lean, leanTicks } = BLUE_HEAVY_FEEL;
  return -fighter.facing * Math.round(lean * Math.min(1, (time + 1) / leanTicks));
}
