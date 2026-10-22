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

// a boss's own art sets how far its shared swings reach (`reach` in its type), so a blow lands
// where its weapon is drawn
export const hitboxOf = (fighter, move) => fighter.def?.reach?.[move.id] ?? move.hitbox;

export const swingBox = (fighter, move = fighter.move) =>
  attackBox(fighter, hitboxOf(fighter, move));

// a boss dug into the ground, or dissolved into sand, is out of every reach until it is back
export function isOutOfReach(fighter) {
  const move = fighter.state === 'attack' && fighter.move;
  const span = move && (move.underground ?? move.vanish);
  return Boolean(span) && fighter.moveTime >= span[0] && fighter.moveTime < span[1];
}

export function hurtBox(fighter) {
  if (fighter.removed || fighter.state === 'ko' || isOutOfReach(fighter)) {
    return null;
  }
  const [left, top, width, height] =
    HURT_SHAPES[fighter.state] || fighter.def?.hurtShape || STANDING_SHAPE;
  const scale = fighter.scale;
  // a body drawn off its feet (a scorpion's tail behind her) is measured facing right
  const behind = fighter.facing < 0 ? width - left : left;
  return {
    x: fighter.x - behind * scale,
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
