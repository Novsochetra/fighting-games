import { codeOf, EYE_CODE, eachPixelIn, setPixel } from './buffer.js';
import { FIGURE_SCALE } from './scale.js';
import { shadeFor } from './shading.js';

const HALF = { x: 3.5 * FIGURE_SCALE, y: 4.3 * FIGURE_SCALE };
const HAIR_ROWS = 2.6 * FIGURE_SCALE;
const EYES = { ahead: 2.4 * FIGURE_SCALE, apart: 1.5 * FIGURE_SCALE };

const isCorner = (dx, dy) =>
  Math.abs(dx) > HALF.x - FIGURE_SCALE && Math.abs(dy) > HALF.y - 1.2 * FIGURE_SCALE;

// a column of the head faces the way its surface does: the back of the head is hair, the
// front is face, and the hair comes down over the temples
function isHair({ dx, dy }, forward) {
  const across = dx / HALF.x;
  const facing = across * forward.x + Math.sqrt(Math.max(0, 1 - across * across)) * forward.y;

  if (dy < -HALF.y + HAIR_ROWS) {
    return true;
  }

  const isTemple = Math.abs(across) > 0.7 && facing < 0.7 && dy < -0.6 * FIGURE_SCALE;

  return (facing < -0.3 && dy < HALF.y - 1.4 * FIGURE_SCALE) || isTemple;
}

function paintSkull(buffer, part, index) {
  const { centre } = part;
  const box = {
    left: centre.x - HALF.x,
    right: centre.x + HALF.x,
    top: centre.y - HALF.y,
    bottom: centre.y + HALF.y,
  };

  eachPixelIn(buffer, box, (x, y, point) => {
    const offset = { dx: point.x - centre.x, dy: point.y - centre.y };

    if (Math.abs(offset.dx) > HALF.x || Math.abs(offset.dy) > HALF.y) {
      return;
    }

    if (!isCorner(offset.dx, offset.dy)) {
      const material = isHair(offset, part.forward) ? 'hair' : 'skin';
      const shade = shadeFor({ x: offset.dx / HALF.x, y: (offset.dy / HALF.y) * 0.6 }, false);

      setPixel(buffer, { x, y, code: codeOf(material, shade), part: index });
    }
  });
}

function paintTufts(buffer, { centre }, index) {
  const top = Math.floor(centre.y - HALF.y + buffer.anchor.y) - 1;
  const left = Math.ceil(centre.x - HALF.x + buffer.anchor.x);

  for (let x = left; x < left + 2 * HALF.x - 1; x += 2) {
    setPixel(buffer, { x, y: top, code: codeOf('hair', 2), part: index });
  }
}

function paintEyes(buffer, { centre, forward, right }, index) {
  for (const side of [-1, 1]) {
    const depth = EYES.ahead * forward.y + side * EYES.apart * right.y;
    const x = centre.x + EYES.ahead * forward.x + side * EYES.apart * right.x;

    if (depth > 0.2) {
      setPixel(buffer, {
        x: Math.floor(x + buffer.anchor.x),
        y: Math.floor(centre.y + buffer.anchor.y),
        code: EYE_CODE,
        part: index,
      });
    }
  }
}

export function paintHead(buffer, part, index) {
  const turn = (part.yaw * Math.PI) / 180;
  const head = {
    ...part,
    forward: { x: Math.cos(turn), y: Math.sin(turn) },
    right: { x: -Math.sin(turn), y: Math.cos(turn) },
  };

  paintSkull(buffer, head, index);
  paintTufts(buffer, head, index);
  paintEyes(buffer, head, index);
}
