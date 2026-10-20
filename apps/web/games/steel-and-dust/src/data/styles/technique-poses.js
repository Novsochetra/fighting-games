import { LIFT_STRIKE, LIFT_WINDUP } from '../poses.js';

// the techniques swing like the sword moves they grew from, so they borrow those poses
export const CHOP = {
  windup: { frontArm: -2.3, frontForearm: -2.6, weaponAngle: -3, torso: -1.75 },
  strike: {
    frontArm: 0.8,
    frontForearm: 1.1,
    weaponAngle: 1.4,
    torso: -1.1,
    crouch: 3,
    frontFoot: 8,
  },
};

export const SWEEP = {
  windup: { crouch: 4, frontArm: -1.6, frontForearm: -1.9, weaponAngle: -2.2 },
  strike: { crouch: 7, frontArm: 1.1, frontForearm: 1.3, weaponAngle: 1.45, frontFoot: 8 },
};

export const THRUST = {
  windup: { frontArm: 1.9, frontForearm: 2.9, weaponAngle: 0, torso: -1.6, frontFoot: 2 },
  strike: {
    frontArm: 0,
    frontForearm: 0,
    weaponAngle: 0,
    torso: -1.15,
    frontFoot: 11,
    backFoot: -9,
  },
};

export const LIFT = { windup: LIFT_WINDUP, strike: LIFT_STRIKE };

export const SPIN = {
  windup: { torso: -1.7, frontArm: 2.8, frontForearm: 3, weaponAngle: 3.05 },
  strike: { frontArm: 0.1, frontForearm: 0, weaponAngle: 0, torso: -1.25, frontFoot: 8, spin: 0.5 },
};

export const HOOK = {
  windup: { frontArm: 1.3, frontForearm: 1.8, weaponAngle: 2.3 },
  strike: { frontArm: -1.1, frontForearm: -1.5, weaponAngle: -1.9, torso: -1.35 },
};

export const DIVE = {
  windup: { frontArm: -1.6, frontForearm: -1.6, weaponAngle: -1.57 },
  strike: { frontArm: 1.2, frontForearm: 1.5, weaponAngle: 1.57, torso: -1.6 },
};

export const METEOR = {
  windup: { frontArm: -2.3, frontForearm: -2.6, weaponAngle: -3 },
  strike: { frontArm: 1, frontForearm: 1.3, weaponAngle: 1.5 },
};

export const AIR_SPIN = {
  windup: { frontArm: 2.8, frontForearm: 3, weaponAngle: 3.05 },
  strike: { frontArm: 0.1, frontForearm: 0, weaponAngle: 0, spin: 0.6 },
};
