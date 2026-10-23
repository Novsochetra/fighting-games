import { drawGrove } from './moss-grove.js';
import { MOSS_PARTICLE_DRAWS } from './moss-particles.js';
import { drawSwingOver, drawSwingUnder } from './moss-swing.js';

// what the Moss Shade's heavies draw beyond what every Shade's share: its leaves, spores, thorns and
// brambles, moss sprouting under its feet and whirling leaves behind it, and the leafy crescent of its
// strike in front
export const MOSS_HEAVY_RENDER = {
  particles: MOSS_PARTICLE_DRAWS,
  under(painter, layer) {
    drawGrove(painter, layer);
    drawSwingUnder(painter, layer);
  },
  over: drawSwingOver,
};
