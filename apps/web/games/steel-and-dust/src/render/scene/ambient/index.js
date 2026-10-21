import { drawAsh } from './ash.js';
import { drawBats } from './bats.js';
import { drawBirds } from './birds.js';
import { drawBraziers } from './braziers.js';
import { drawButterflies } from './butterflies.js';
import { drawDevil } from './devil.js';
import { drawEmbers } from './embers.js';
import { drawFireflies } from './fireflies.js';
import { drawFlames } from './flames.js';
import { drawGlints } from './glints.js';
import { drawGlow } from './glow.js';
import { drawGusts } from './gusts.js';
import { drawLeaves } from './leaves.js';
import { drawLightning } from './lightning.js';
import { drawMirage } from './mirage.js';
import { drawMist } from './mist.js';
import { drawMotes } from './motes.js';
import { drawPennants } from './pennants.js';
import { drawPlume } from './plume.js';
import { drawPlumes } from './plumes.js';
import { drawSandDrift } from './sand-drift.js';
import { drawShafts } from './shafts.js';
import { drawShimmer } from './shimmer.js';
import { drawSmoke } from './smoke.js';
import { drawSparks } from './sparks.js';
import { drawSteam } from './steam.js';
import { drawTrickle } from './trickle.js';
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
  glow: { draw: drawGlow, color: 'furnace' },
  sparks: { draw: drawSparks, color: 'sparks' },
  plume: { draw: drawPlume, color: 'plume' },
  steam: { draw: drawSteam, color: 'steam' },
  shimmer: { draw: drawShimmer, color: 'shimmer' },
  ash: { draw: drawAsh, color: 'ash' },
  flames: { draw: drawFlames, color: 'flame' },
  lightning: { draw: drawLightning, color: 'lightning' },
  pennants: { draw: drawPennants, color: 'pennant' },
  mirage: { draw: drawMirage, color: 'mirage' },
  braziers: { draw: drawBraziers, color: 'flame' },
  trickle: { draw: drawTrickle, color: 'trickle' },
  bats: { draw: drawBats, color: 'bat' },
  sandDrift: { draw: drawSandDrift, color: 'sandDrift' },
  glints: { draw: drawGlints, color: 'glints' },
  butterflies: { draw: drawButterflies, color: 'butterflies' },
};

// an unknown kind or a forest without the effect's color is skipped rather than breaking the frame
export function drawAmbientEffect(painter, air) {
  const ambient = AMBIENT_EFFECTS[air.effect.kind];
  if (ambient && air.colors?.[ambient.color]) {
    ambient.draw(painter, air);
  }
}

export function drawAmbient(painter, { effects, plane, tick, cameraX, colors }) {
  for (const effect of effects ?? []) {
    if (effect.plane === plane) {
      drawAmbientEffect(painter, { effect, tick, cameraX, colors });
    }
  }
}
