import { POSE_KEYS } from '../../data/poses.js';

export function blendPoses(from, to, amount) {
  const pose = {};
  for (const key of POSE_KEYS) {
    pose[key] = from[key] + (to[key] - from[key]) * amount;
  }
  return pose;
}

export function addSpin(pose, angle) {
  pose.frontArm += angle;
  pose.frontForearm += angle;
  pose.weaponAngle += angle;
}
