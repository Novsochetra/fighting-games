import { drawAsh } from './ash.js';
import { drawBirds } from './birds.js';
import { drawEmbers } from './embers.js';
import { drawFireflies } from './fireflies.js';
import { drawGlow } from './glow.js';
import { drawLeaves } from './leaves.js';
import { drawMist } from './mist.js';
import { drawMotes } from './motes.js';
import { drawPlume } from './plume.js';
import { drawShafts } from './shafts.js';
import { drawShimmer } from './shimmer.js';
import { drawSmoke } from './smoke.js';
import { drawSparks } from './sparks.js';
import { drawSteam } from './steam.js';

export { wrapX } from './motion.js';

const AMBIENT_EFFECTS = {
  mist: { draw: drawMist, color: 'mist' },
  birds: { draw: drawBirds, color: 'bird' },
  leaves: { draw: drawLeaves, color: 'leaves' },
  motes: { draw: drawMotes, color: 'mote' },
  shafts: { draw: drawShafts, color: 'shaft' },
  fireflies: { draw: drawFireflies, color: 'fireflies' },
  embers: { draw: drawEmbers, color: 'embers' },
  smoke: { draw: drawSmoke, color: 'smoke' },
  glow: { draw: drawGlow, color: 'furnace' },
  sparks: { draw: drawSparks, color: 'sparks' },
  plume: { draw: drawPlume, color: 'plume' },
  steam: { draw: drawSteam, color: 'steam' },
  shimmer: { draw: drawShimmer, color: 'shimmer' },
  ash: { draw: drawAsh, color: 'ash' },
};

// an unknown kind or a forest without the effect's color is skipped rather than breaking the frame
export function drawAmbient(painter, { effects, plane, tick, cameraX, colors }) {
  for (const effect of effects ?? []) {
    const ambient = AMBIENT_EFFECTS[effect.kind];
    if (effect.plane === plane && ambient && colors?.[ambient.color]) {
      ambient.draw(painter, { effect, tick, cameraX, colors });
    }
  }
}
