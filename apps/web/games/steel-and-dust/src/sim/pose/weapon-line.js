const REACH = {
  sword: [-3, 15],
  spear: [-9, 20],
  axe: [-2, 13],
  knife: [-1, 6],
  hammer: [-3, 16],
};

export function weaponLine(fighter, joints, pose) {
  const type = fighter.weapon.id;
  const dx = Math.cos(pose.weaponAngle) * fighter.facing;
  const dy = Math.sin(pose.weaponAngle);
  const hand = joints.frontHand;
  if (type === 'shield') {
    return { type, grip: hand, tip: hand, dx, dy };
  }
  const reach = REACH[type];
  if (!reach) {
    return null;
  }
  const at = (length) => ({
    x: hand.x + dx * length * fighter.scale,
    y: hand.y + dy * length * fighter.scale,
  });
  return { type, grip: at(reach[0]), tip: at(reach[1]), dx, dy };
}

// the outer and inner edge of a swing's smear: the weapon tip (or the foot for kicks) and a point
// near the hand
export function strikePoints(fighter) {
  const joints = fighter.joints;
  if (fighter.move.tip === 'foot') {
    return {
      tip: joints.frontFoot,
      inner: {
        x: (joints.hip.x + joints.frontFoot.x) / 2,
        y: (joints.hip.y + joints.frontFoot.y) / 2,
      },
    };
  }
  const line = weaponLine(fighter, joints, fighter.pose);
  if (line) {
    return {
      tip: line.tip,
      inner: {
        x: joints.frontHand.x * 0.55 + line.tip.x * 0.45,
        y: joints.frontHand.y * 0.55 + line.tip.y * 0.45,
      },
    };
  }
  return { tip: joints.frontHand, inner: joints.frontElbow };
}
