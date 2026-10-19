export const BASE_POSE = {
  torso: -1.45,
  crouch: 0,
  frontFoot: 4,
  backFoot: -4,
  frontLift: 0,
  backLift: 0,
  frontArm: 1.1,
  frontForearm: -0.6,
  backArm: 1.3,
  backForearm: 0.5,
  weaponAngle: -1.1,
};

export const POSE_KEYS = Object.keys(BASE_POSE);

export const HURT_POSE = {
  torso: -1.95,
  crouch: 2,
  frontFoot: 5,
  backFoot: -5,
  frontLift: 0,
  backLift: 0,
  frontArm: 2,
  frontForearm: 2.6,
  backArm: 2.4,
  backForearm: 2.9,
  weaponAngle: 2.2,
};

export const JUGGLE_POSE = {
  torso: -2.4,
  crouch: -2,
  frontFoot: 7,
  frontLift: 8,
  backFoot: 2,
  backLift: 6,
  frontArm: -2.3,
  frontForearm: -2.6,
  backArm: -2,
  backForearm: -2.5,
  weaponAngle: -2.8,
};

export const LYING_POSE = {
  torso: 3.09,
  crouch: 12,
  frontFoot: 13,
  frontLift: 1,
  backFoot: 11,
  backLift: 3,
  frontArm: 2.8,
  frontForearm: 3.1,
  backArm: 3,
  backForearm: 3.2,
  weaponAngle: 3.1,
};

export const LIFT_WINDUP = { crouch: 4, frontArm: 1.5, frontForearm: 1.7, weaponAngle: 1.9 };
export const LIFT_STRIKE = {
  crouch: -3,
  frontLift: 3,
  frontArm: -1.4,
  frontForearm: -1.6,
  weaponAngle: -1.7,
};

export const DASH_POSE = {
  crouch: 6,
  torso: -0.75,
  frontFoot: 6,
  frontLift: 2,
  backFoot: -8,
  backLift: 3,
  frontArm: 1.9,
  frontForearm: 2.6,
  backArm: 2.2,
  backForearm: 2.8,
  weaponAngle: 2.6,
};
