const HURT_SHAPES = {
  down: [12, 8, 24, 8],
  getup: [12, 8, 24, 8],
  juggle: [8, 26, 16, 24],
  dash: [6, 16, 12, 16],
};
const STANDING_SHAPE = [6, 32, 12, 32];

export function attackBox(fighter, hitbox) {
  const scale = fighter.scale;
  const left =
    fighter.facing > 0
      ? fighter.x + hitbox[0] * scale
      : fighter.x - (hitbox[0] + hitbox[2]) * scale;
  return {
    x: left,
    y: fighter.y + hitbox[1] * scale,
    width: hitbox[2] * scale,
    height: hitbox[3] * scale,
  };
}

export function hurtBox(fighter) {
  if (fighter.removed || fighter.state === 'ko') {
    return null;
  }
  const [left, top, width, height] =
    HURT_SHAPES[fighter.state] || fighter.def?.hurtShape || STANDING_SHAPE;
  const scale = fighter.scale;
  return {
    x: fighter.x - left * scale,
    y: fighter.y - top * scale,
    width: width * scale,
    height: height * scale,
  };
}

export function overlaps(first, second) {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}

export function overlapCenter(first, second) {
  return {
    x: (Math.max(first.x, second.x) + Math.min(first.x + first.width, second.x + second.width)) / 2,
    y:
      (Math.max(first.y, second.y) + Math.min(first.y + first.height, second.y + second.height)) /
      2,
  };
}

export function crateBox(crate) {
  return { x: crate.x - 8, y: crate.y - 15, width: 16, height: 15 };
}

export function knifeBox(knife) {
  return { x: knife.x - 5, y: knife.y - 4, width: 10, height: 8 };
}
