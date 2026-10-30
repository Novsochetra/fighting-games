// as pad-styles.js sizes a control that has no size of its own
const BASE_SIZE = { stick: 128, button: 64, dpad: 64 };

const STEP = 0.01;

const apart = (low, high) => Math.max(0, low - high);

// a control at a scale where the pad's rules stand it (pad-styles.js), `layer` being the safe area:
// a round key or a pill is the line its round ends sweep along, and their radius; a d-pad is its
// square, and a stick its round base
export function outlineOf(item, layer, scale) {
  const across = (item.size ?? BASE_SIZE[item.kind]) * scale;
  const down = across * (item.aspect ?? 1);
  const x = layer.left + item.at.x * layer.width + (item.at.dx ?? 0) * scale;
  const y = layer.top + item.at.y * layer.height + (item.at.dy ?? 0) * scale;
  const radius = item.kind === 'dpad' ? 0 : Math.min(across, down) / 2;
  const box = {
    left: x - across / 2,
    right: x + across / 2,
    top: y - down / 2,
    bottom: y + down / 2,
  };
  const sweep =
    item.kind === 'dpad'
      ? box
      : { left: box.left + radius, right: box.right - radius, top: y, bottom: y };

  return { id: item.id, box, sweep, radius };
}

// less than 0 where they overlap; a rect is an outline with no radius
export function gapBetween(first, second) {
  const one = first.sweep ?? first;
  const other = second.sweep ?? second;
  const across = Math.max(apart(one.left, other.right), apart(other.left, one.right));
  const down = Math.max(apart(one.top, other.bottom), apart(other.top, one.bottom));

  return Math.hypot(across, down) - (first.radius ?? 0) - (second.radius ?? 0);
}

const inside = ({ box }, layer) =>
  box.left >= layer.left &&
  box.top >= layer.top &&
  box.right <= layer.left + layer.width &&
  box.bottom <= layer.top + layer.height;

const shapesApart = (shapes, others, gap) =>
  shapes.every((shape) => others.every((other) => gapBetween(shape, other) >= gap));

function controlsApart(outlines, gap) {
  return outlines.every((shapes, i) =>
    outlines.slice(i + 1).every((others) => shapesApart(shapes, others, gap)),
  );
}

function fits({ variants, layer, keepOut, gap }, scale) {
  const outlines = variants.map((shapes) => shapes.map((item) => outlineOf(item, layer, scale)));
  const kept = keepOut(scale);
  const shapes = outlines.flat();

  return (
    shapes.every((shape) => inside(shape, layer)) &&
    shapes.every((shape) => kept.every((rect) => gapBetween(shape, rect) >= 0)) &&
    controlsApart(outlines, gap * scale)
  );
}

// controls anchored to opposite edges close in on each other as the scale grows, as their offsets
// grow and the screen does not, so a large Button size can crowd them on a small phone; `keepOut`
// takes the scale, as a shell's bezel moves with it
export function roomyScale({ variants, layer, keepOut = () => [], wanted, floor, gap }) {
  const room = { variants, layer, keepOut, gap };

  if (!variants.every((shapes) => shapes.every((item) => item.at))) {
    return wanted;
  }

  for (let scale = wanted; scale > floor; scale = Math.round((scale - STEP) * 100) / 100) {
    if (fits(room, scale)) {
      return scale;
    }
  }

  return Math.min(floor, wanted);
}
