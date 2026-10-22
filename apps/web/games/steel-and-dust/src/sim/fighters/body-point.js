// a point on a fighter's body (a boss's mouth, eyes or fist), given in its own units: world pixels
// at scale 1, ahead along its facing and up from its feet; it grows with the fighter's scale, so an
// effect leaves the same spot on the art however big the fighter is drawn
export function bodyPoint(fighter, { ahead = 0, up = 0 }) {
  return {
    x: fighter.x + fighter.facing * ahead * fighter.scale,
    y: fighter.y - up * fighter.scale,
  };
}

// an effect drawn on a fighter's body (a glint, a howl, steam at its back) is as big as the body:
// `size` is its scale for a fighter of scale 1
export const bodySize = (fighter, size) => size * fighter.scale;
