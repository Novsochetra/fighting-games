import { drawBirds } from './birds.js';
import { drawDevil } from './devil.js';
import { drawEmbers } from './embers.js';
import { drawFireflies } from './fireflies.js';
import { drawGusts } from './gusts.js';
import { drawLeaves } from './leaves.js';
import { drawMist } from './mist.js';
import { drawMotes } from './motes.js';
import { drawPlumes } from './plumes.js';
import { drawShafts } from './shafts.js';
import { drawSmoke } from './smoke.js';
import { drawTumbleweeds } from './tumbleweeds.js';
import { drawVeil } from './veil.js';
import { drawVultures } from './vultures.js';

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
  gusts: { draw: drawGusts, color: 'gusts' },
  veil: { draw: drawVeil, color: 'veil' },
  plumes: { draw: drawPlumes, color: 'plume' },
  devil: { draw: drawDevil, color: 'devil' },
  vultures: { draw: drawVultures, color: 'vulture' },
  tumbleweeds: { draw: drawTumbleweeds, color: 'tumbleweed' },
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
