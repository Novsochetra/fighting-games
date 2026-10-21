// rects are screen rects (left, top, width, height); fractions are of the touch layer's rect, so
// they do not change when a menu transition moves or scales the whole layer
const share = (part, whole, fallback) => (whole > 0 ? part / whole : fallback);

export function fractionOf(point, layer) {
  return {
    x: share(point.x - layer.left, layer.width, 0.5),
    y: share(point.y - layer.top, layer.height, 0.5),
  };
}

export function centreOf(rect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export function halfExtentOf(rect, layer, size) {
  return {
    x: share(rect.width / 2, layer.width * size, 0),
    y: share(rect.height / 2, layer.height * size, 0),
  };
}

export function overlaps(first, second) {
  return (
    first.left < second.left + second.width &&
    second.left < first.left + first.width &&
    first.top < second.top + second.height &&
    second.top < first.top + first.height
  );
}

// what a toolbar in `bar` would hide of `buttons` ({ action, rect }); the picked button counts most,
// as it is the one being moved or resized
export function coverCost(buttons, bar, picked) {
  return buttons.reduce((cost, { action, rect }) => {
    if (!overlaps(rect, bar)) {
      return cost;
    }
    return cost + (action === picked ? 10 : 1);
  }, 0);
}
