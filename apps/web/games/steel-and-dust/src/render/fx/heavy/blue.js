import { blueUnder } from './blue-ground.js';
import { blueOver } from './blue-layers.js';
import { BLUE_PARTICLE_DRAWS } from './blue-particles.js';

// what the Blue Shade's heavies draw beyond what every Shade's share: its ice, mist and cuts, rime
// spreading under its feet as it coils, and over it the hilt's wink and the one cold line of the draw
export const BLUE_HEAVY_RENDER = {
  particles: BLUE_PARTICLE_DRAWS,
  under: blueUnder,
  over: blueOver,
};
