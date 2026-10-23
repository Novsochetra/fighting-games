import { ANTLER_HEAVY_FEEL as FEEL } from '../../../data/heavy-feel/antler.js';
import { heroAnimation } from '../../../sim/hero-animation.js';

// where the top of the Shade's hood is in each frame of the strips its heavies play, in world pixels
// from its feet facing right, read off its sprites, so the spirit antlers stay on its head
const HOOD_TOPS = {
  cleave: [0, 0, -0.5, 2, 3, 1.5, 1.5, 2],
  rising_dragon: [1.5, 0.5, -2, -1.5, -1.5, 0],
  spin_slash: [1, 1, -0.5, -1, -2, -2],
  thrust: [1, 2, 1, -1.5, -2.5, 1.5],
  meteor_slash: [-2, -2, -2.5, 0],
  plunge: [2, 2, 3, -3.5],
  slash2: [1, 1, 0.5, 0, 0],
};
const HOOD_HEIGHTS = {
  cleave: [-29, -29, -29.5, -27, -25.5, -27, -27, -27.5],
  rising_dragon: [-28, -28.5, -28, -26.5, -26.5, -26.5],
  spin_slash: [-28.5, -28.5, -29, -28.5, -28, -28],
  thrust: [-29, -28, -26, -25, -25.5, -26.5],
  meteor_slash: [-28.5, -28.5, -28, -25.5],
  plunge: [-26, -26, -25, -18.5],
  slash2: [-28.5, -27, -28.5, -27.5, -27.5],
};
const DEFAULT_TOP = [1, -28.5];
// the antlers grow from a little inside the hood, so the hood hides where they start
const ROOT_DEPTH = 1.5;

// the hero's drawn lean (heavy-glow.js) is not handed to the layers, and importing it here would
// close an import loop through render/fx/heavy/index.js, so it is worked out from the same feel
export function leanOf(fighter, time, startup) {
  if (time >= startup) {
    return 0;
  }
  return -fighter.facing * Math.round(FEEL.lean * Math.min(1, (time + 1) / FEEL.leanTicks));
}

// the root of the antlers in the world, following the hood through the frame drawn now
export function antlerRoot(fighter, time, startup) {
  const [strip, index] = heroAnimation(fighter);
  const dx = HOOD_TOPS[strip]?.[index] ?? DEFAULT_TOP[0];
  const dy = HOOD_HEIGHTS[strip]?.[index] ?? DEFAULT_TOP[1];
  return {
    x: fighter.x + leanOf(fighter, time, startup) + dx * fighter.facing,
    y: fighter.y + dy + ROOT_DEPTH,
  };
}
