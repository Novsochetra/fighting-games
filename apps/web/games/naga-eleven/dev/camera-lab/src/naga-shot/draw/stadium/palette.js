import { SHOT_ART } from '../../colors.js';

const { purple, ink, gold, emerald } = SHOT_ART;
const [s0, s1, s2, s3, s4, s5, s6] = SHOT_ART.stadium.sky;
const [p0, p1, p2] = purple;

// lightest just over the roof, so the Naga's dark shape stands out against it
export const SKY_BY_DUSK = [
  [s0, s1, s2, s3, s4, s5, s6],
  [s0, s1, s2, s3, s4, s5, s5],
  [s0, s0, s1, s2, s3, s5, p1],
  [s0, s0, p0, s2, s3, p1, p2],
  [ink, ink, p0, p0, p1, p1, p2],
];

export const CROWD_IN_DARK = { rim: p2, head: p1, body: p0 };

const TURF = [...SHOT_ART.stadium.grass, ...SHOT_ART.stadium.line];

export const TURF_TONES = { dark: 4, mid: 5, light: 6, fleck: 7, line: 9, lineShade: 8 };

export const turfColour = (tone, dusk) => TURF[Math.max(0, Math.min(TURF.length - 1, tone - dusk))];

export const POOL_RAMP = emerald;

export const POOL_SPARK = [gold[2], gold[3]];

const shirts = SHOT_ART.stadium.crowd.shirts;

// the whites held a step down, so no fan is ever as white as the ball flying past him
export const CROWD_RAMPS = [
  [shirts[0][0], shirts[0][1], SHOT_ART.crowd[0], shirts[0][2]],
  [shirts[4][0], shirts[4][1], shirts[4][2], SHOT_ART.crowd[1]],
  [shirts[6][0], shirts[6][0], shirts[6][1], SHOT_ART.crowd[2]],
  [shirts[2][0], shirts[2][1], SHOT_ART.crowd[3], shirts[2][2]],
  [shirts[7][0], shirts[7][1], shirts[7][2], SHOT_ART.crowd[4]],
  [shirts[8][0], shirts[8][1], SHOT_ART.crowd[5], shirts[8][2]],
];

// a step below a ramp's deepest is the night's purple, so a darkened crowd turns one with the sky
export function crowdTone(ramp, step) {
  if (step >= 0) {
    return ramp[Math.min(ramp.length - 1, step)];
  }

  return step === -1 ? p1 : p0;
}

export const SKINS = SHOT_ART.stadium.crowd.skins;

export const HAIRS = [...SHOT_ART.stadium.crowd.hairs, SHOT_ART.stadium.crowd.hairLight];

export const LAMP_BY_DUSK = [
  [SHOT_ART.white, SHOT_ART.lights],
  [SHOT_ART.lights, gold[3]],
  [gold[2], gold[1]],
  [gold[1], gold[0]],
  [SHOT_ART.stadium.steel[1], SHOT_ART.stadium.steel[0]],
];

export const HALO_BY_DUSK = [[SHOT_ART.stadium.glow, s6], [s6, s5], [], [], []];

export const STEEL = SHOT_ART.stadium.steel;

export const CONCRETE = SHOT_ART.stadium.concrete;

export const ROOF = SHOT_ART.stadium.roof;

export const ROOF_UNDER = SHOT_ART.stadium.roofUnder;

export const SEATS = SHOT_ART.stadium.seats;

export const STARS = SHOT_ART.stadium.star;

export const NIGHT_TOP = (dusk) => SKY_BY_DUSK[dusk][0];

export { p0 as DUSK_PURPLE, p2 as DUSK_VIOLET };
