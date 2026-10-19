import { poseForState } from './pose-for-state.js';
import { rig } from './rig.js';

export function refreshPose(fighter) {
  fighter.pose = poseForState(fighter);
  fighter.joints = rig(fighter, fighter.pose);
}
