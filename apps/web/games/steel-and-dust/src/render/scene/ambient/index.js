import { drawBats } from './bats.js';
import { drawBirds } from './birds.js';
import { drawEmbers } from './embers.js';
import { drawFireflies } from './fireflies.js';
import { drawFlames } from './flames.js';
import { drawLeaves } from './leaves.js';
import { drawMirage } from './mirage.js';
import { drawMist } from './mist.js';
import { drawMotes } from './motes.js';
import { drawSandDrift } from './sand-drift.js';
import { drawShafts } from './shafts.js';
import { drawSmoke } from './smoke.js';
import { drawTrickle } from './trickle.js';

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
  mirage: { draw: drawMirage, color: 'mirage' },
  flames: { draw: drawFlames, color: 'flame' },
  trickle: { draw: drawTrickle, color: 'trickle' },
  bats: { draw: drawBats, color: 'bat' },
  sandDrift: { draw: drawSandDrift, color: 'sandDrift' },
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
