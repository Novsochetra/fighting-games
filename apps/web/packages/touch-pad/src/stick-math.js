// a direction switches on past the outer threshold and off only below the inner one, so a thumb
// resting on the edge does not flicker between running and standing
const THRESHOLDS = { horizontal: [0.38, 0.22], vertical: [0.6, 0.45] };

function engaged(value, wasOn, [on, off]) {
  return value > (wasOn ? off : on);
}

export function stickDirections(normalizedX, normalizedY, current) {
  return {
    right: engaged(normalizedX, current.right, THRESHOLDS.horizontal),
    left: engaged(-normalizedX, current.left, THRESHOLDS.horizontal),
    up: engaged(-normalizedY, current.up, THRESHOLDS.vertical),
    down: engaged(normalizedY, current.down, THRESHOLDS.vertical),
  };
}

// the knob stays on the rim when the thumb goes past it
export function knobOffset(dx, dy, radius) {
  const distance = Math.hypot(dx, dy);
  const scale = distance > radius ? radius / distance : 1;
  return { x: dx * scale, y: dy * scale };
}

// a floating stick's base follows a thumb that slides well past its rim
export function followThumb(center, thumb, radius) {
  const dx = thumb.x - center.x;
  const dy = thumb.y - center.y;
  const distance = Math.hypot(dx, dy);
  const reach = radius * 1.35;
  if (distance <= reach) {
    return center;
  }
  const pull = (distance - reach) / distance;
  return { x: center.x + dx * pull, y: center.y + dy * pull };
}

export function isNearFixedStick(center, thumb, radius) {
  return Math.hypot(thumb.x - center.x, thumb.y - center.y) <= radius * 1.9;
}
