import { codeOf, eachPixelIn, setPixel } from './buffer.js';
import { paintHead } from './head.js';
import { shadeFor } from './shading.js';

function closestOnSegment(point, { from, to }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const span = dx * dx + dy * dy;
  const share = span === 0 ? 0 : ((point.x - from.x) * dx + (point.y - from.y) * dy) / span;
  const along = Math.min(1, Math.max(0, share));

  return { x: from.x + dx * along, y: from.y + dy * along, along };
}

function paintCapsule(buffer, part, index) {
  const { from, to, radius } = part;
  const box = {
    left: Math.min(from.x, to.x) - radius,
    right: Math.max(from.x, to.x) + radius,
    top: Math.min(from.y, to.y) - radius,
    bottom: Math.max(from.y, to.y) + radius,
  };

  eachPixelIn(buffer, box, (x, y, point) => {
    const near = closestOnSegment(point, part);
    const normal = { x: (point.x - near.x) / radius, y: (point.y - near.y) / radius };

    if (normal.x * normal.x + normal.y * normal.y <= 1) {
      const shade = shadeFor(normal, part.far);

      setPixel(buffer, { x, y, code: codeOf(part.material(near.along), shade), part: index });
    }
  });
}

const cross = (origin, first, second) =>
  (first.x - origin.x) * (second.y - origin.y) - (first.y - origin.y) * (second.x - origin.x);

function hullOf(points) {
  const sorted = [...points].sort((first, second) => first.x - second.x || first.y - second.y);
  const half = (list) =>
    list.reduce((hull, point) => {
      while (hull.length > 1 && cross(hull.at(-2), hull.at(-1), point) <= 0) {
        hull.pop();
      }

      return [...hull, point];
    }, []);

  return [...half(sorted).slice(0, -1), ...half([...sorted].reverse()).slice(0, -1)];
}

// the hull winds one way or the other; a point inside is on the same side of every edge
function isInside(hull, point) {
  const sides = hull.map((corner, i) =>
    Math.sign(cross(corner, hull[(i + 1) % hull.length], point)),
  );

  return sides.every((side) => side >= 0) || sides.every((side) => side <= 0);
}

function paintHull(buffer, part, index) {
  const hull = hullOf(part.points);
  const xs = hull.map((point) => point.x);
  const ys = hull.map((point) => point.y);
  const box = { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys) };

  box.bottom = Math.max(...ys);

  const middle = { x: (box.left + box.right) / 2, y: (box.top + box.bottom) / 2 };
  const half = { x: (box.right - box.left) / 2, y: (box.bottom - box.top) / 2 };

  eachPixelIn(buffer, box, (x, y, point) => {
    if (isInside(hull, point)) {
      const normal = { x: (point.x - middle.x) / half.x, y: ((point.y - middle.y) / half.y) * 0.5 };
      const code = codeOf(part.material(), shadeFor(normal, false));

      setPixel(buffer, { x, y, code, part: index });
    }
  });
}

const PAINTERS = { capsule: paintCapsule, hull: paintHull, head: paintHead };

export function paintParts(buffer, parts) {
  parts.forEach((part, index) => PAINTERS[part.shape](buffer, part, index));
}
