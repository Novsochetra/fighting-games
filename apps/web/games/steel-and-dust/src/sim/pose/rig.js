const THIGH = 8;
const LEG = 16;

function knee(hip, foot, facing, scale) {
  const dx = foot.x - hip.x;
  const dy = foot.y - hip.y;
  const distance = Math.hypot(dx, dy) || 1;
  const thigh = THIGH * scale;
  const midX = (hip.x + foot.x) / 2;
  const midY = (hip.y + foot.y) / 2;
  if (distance >= 2 * thigh) {
    return { x: midX, y: midY };
  }
  const offset = Math.sqrt(thigh * thigh - (distance / 2) * (distance / 2));
  let bendX = -dy / distance;
  let bendY = dx / distance;
  if (bendX * facing - bendY * 0.5 < -bendX * facing + bendY * 0.5) {
    bendX = -bendX;
    bendY = -bendY;
  }
  return { x: midX + bendX * offset, y: midY + bendY * offset };
}

function footAt(hip, target, scale) {
  const dx = target.x - hip.x;
  const dy = target.y - hip.y;
  const distance = Math.hypot(dx, dy);
  const reach = LEG * scale;
  if (distance <= reach) {
    return { x: target.x, y: target.y };
  }
  return { x: hip.x + (dx / distance) * reach, y: hip.y + (dy / distance) * reach };
}

function torsoJoints(fighter, pose) {
  const { x, y, facing, scale } = fighter;
  const hip = { x, y: y + (-15 + pose.crouch) * scale };
  const along = (length) => ({
    x: hip.x + Math.cos(pose.torso) * length * scale * facing,
    y: hip.y + Math.sin(pose.torso) * length * scale,
  });
  const neck = along(11);
  const head = {
    x: neck.x + Math.cos(pose.torso) * 4.5 * scale * facing,
    y: neck.y + Math.sin(pose.torso) * 4.5 * scale,
  };
  return { hip, neck, head, shoulder: along(9) };
}

export function rig(fighter, pose) {
  const { x, y, facing, scale } = fighter;
  const { hip, neck, head, shoulder } = torsoJoints(fighter, pose);
  const segment = (origin, angle, length) => ({
    x: origin.x + Math.cos(angle) * length * scale * facing,
    y: origin.y + Math.sin(angle) * length * scale,
  });
  const frontElbow = segment(shoulder, pose.frontArm, 6);
  const backElbow = segment(shoulder, pose.backArm, 6);
  const frontFoot = footAt(
    hip,
    { x: x + pose.frontFoot * scale * facing, y: y - pose.frontLift * scale },
    scale,
  );
  const backFoot = footAt(
    hip,
    { x: x + pose.backFoot * scale * facing, y: y - pose.backLift * scale },
    scale,
  );
  return {
    hip,
    neck,
    head,
    shoulder,
    frontElbow,
    frontHand: segment(frontElbow, pose.frontForearm, 6),
    backElbow,
    backHand: segment(backElbow, pose.backForearm, 5.5),
    frontFoot,
    backFoot,
    frontKnee: knee(hip, frontFoot, facing, scale),
    backKnee: knee(hip, backFoot, facing, scale),
  };
}
