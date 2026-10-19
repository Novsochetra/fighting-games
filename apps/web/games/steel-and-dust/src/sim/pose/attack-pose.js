import { easeInOutCubic, easeOutCubic } from '../../lib/math.js';
import { addSpin, blendPoses } from './blend.js';

function windupPose(fighter, guard, windup) {
  const { move, moveTime } = fighter;
  const from = fighter.poseAtMoveStart || guard;
  return blendPoses(
    from,
    windup,
    easeOutCubic(Math.min(1, (moveTime + 1) / Math.max(1, move.startup * 0.7))),
  );
}

// the strike snaps in over 1-2 frames
function strikePose(fighter, windup, strike) {
  const { move, moveTime } = fighter;
  const progress = Math.min(1, (moveTime - move.startup + 1) / Math.min(2, move.active));
  const pose = blendPoses(windup, strike, easeOutCubic(progress));
  if (move.strike.spin) {
    addSpin(pose, (moveTime - move.startup) * move.strike.spin);
  }
  if (move.sustain) {
    const sway = Math.sin(fighter.animTime * 0.5) * 4;
    pose.frontFoot += sway;
    pose.backFoot -= sway;
  }
  return pose;
}

function followThroughPose(fighter, guard, strike) {
  const { move, moveTime } = fighter;
  const progress = (moveTime - move.startup - move.active) / move.recovery;
  const settle = fighter.airborne
    ? { ...guard, frontFoot: 4, frontLift: 4, backFoot: -4, backLift: 5 }
    : guard;
  let last = strike;
  if (move.strike.spin) {
    last = { ...strike };
    addSpin(last, ((move.active - 1) * move.strike.spin) % (Math.PI * 2));
  }
  return blendPoses(last, settle, progress < 0.3 ? 0 : easeInOutCubic((progress - 0.3) / 0.7));
}

export function attackPose(fighter, guard) {
  const { move, moveTime } = fighter;
  const windup = { ...guard, ...move.windup };
  const strike = { ...guard, ...move.strike };
  if (moveTime < move.startup) {
    return windupPose(fighter, guard, windup);
  }
  if (moveTime < move.startup + move.active) {
    return strikePose(fighter, windup, strike);
  }
  return followThroughPose(fighter, guard, strike);
}
