import { BASE_POSE, DASH_POSE, HURT_POSE, JUGGLE_POSE, LYING_POSE } from '../../data/poses.js';
import { clamp, easeInOutCubic } from '../../lib/math.js';
import { guardOf } from '../fighters/loadout.js';
import { attackPose } from './attack-pose.js';
import { blendPoses } from './blend.js';

const RISING_AIR = {
  frontFoot: 5,
  frontLift: 7,
  backFoot: -3,
  backLift: 3,
  backArm: -0.8,
  backForearm: -1.2,
};
const FALLING_AIR = {
  frontFoot: 4,
  frontLift: 3,
  backFoot: -5,
  backLift: 6,
  backArm: -0.4,
  backForearm: -0.6,
};

function idlePose(fighter, pose) {
  const bob = (fighter.animTime >> 5) & 1;
  pose.crouch += bob;
  pose.frontArm += bob * 0.05;
  return pose;
}

function walkPose(fighter, pose) {
  const phase = fighter.animTime * 0.21 * (fighter.walkDirection || 1);
  const sin = Math.sin(phase);
  const cos = Math.cos(phase);
  pose.frontFoot = 1 + 6 * sin;
  pose.backFoot = 1 - 6 * sin;
  pose.frontLift = Math.max(0, 3 * cos);
  pose.backLift = Math.max(0, -3 * cos);
  pose.backArm += 0.6 * sin;
  pose.backForearm += 0.3 * sin;
  pose.crouch += Math.abs(sin) > 0.7 ? 0 : 1;
  return pose;
}

function airPose(fighter, pose) {
  Object.assign(pose, fighter.vy < 0 ? RISING_AIR : FALLING_AIR);
  pose.crouch -= 1;
  return pose;
}

function tumblePose(fighter, pose) {
  Object.assign(pose, JUGGLE_POSE);
  pose.torso = -2.3 - clamp(fighter.vy * 0.15, -1, 1);
  return pose;
}

function koPose(fighter, pose) {
  return fighter.airborne ? tumblePose(fighter, pose) : Object.assign(pose, LYING_POSE);
}

function getupPose(fighter, pose) {
  const lying = { ...pose, ...LYING_POSE };
  const crouched = { ...pose, crouch: 4 };
  return blendPoses(lying, crouched, easeInOutCubic(Math.min(1, fighter.stateTime / 16)));
}

function winPose(fighter, pose) {
  return Object.assign(pose, {
    frontArm: -1.5,
    frontForearm: -1.7,
    weaponAngle: -1.6,
    backArm: -1.3,
    backForearm: -1.6,
    crouch: (fighter.animTime >> 4) & 1,
  });
}

const POSE_BY_STATE = {
  idle: idlePose,
  walk: walkPose,
  run: walkPose,
  air: airPose,
  attack: (fighter, pose) => attackPose(fighter, pose),
  hurt: (_fighter, pose) => Object.assign(pose, HURT_POSE),
  juggle: tumblePose,
  ko: koPose,
  down: (_fighter, pose) => Object.assign(pose, LYING_POSE),
  getup: getupPose,
  dash: (_fighter, pose) => Object.assign(pose, DASH_POSE),
  win: winPose,
};

export function poseForState(fighter) {
  const pose = { ...BASE_POSE, ...guardOf(fighter) };
  const build = POSE_BY_STATE[fighter.state];
  return build ? build(fighter, pose) : pose;
}
