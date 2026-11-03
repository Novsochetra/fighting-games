import { SHEET_OUTLINE } from '../../art/actors.js';
import { SPRITE_KIT } from '../../art/sprite-kit.js';
import { SHEET_ARMS, THROW_ARMS } from './throw-arms.js';

// No sheet has a throw-in, so one is made from the footballer's own: seen from the front, the
// arms-up frame of his celebration; from behind, his standing frame. Their arms are taken off and
// drawn again raised over the head, holding the ball, then thrown forward, in the sheets' own
// colours, so the sheet is recoloured to each look as the others are.
const SOURCE = { width: 64, height: 62 };
const LIFT = 12;
const WAYS = ['south', 'north'];
const POSES = ['hold', 'release'];
const NEIGHBOURS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

// frame 0 holds the ball over the head, frame 1 has let it go; `ballHeight` is how far over the
// feet the held ball's middle is, by the way he faces
export const THROW_ANIMATION = {
  frames: 2,
  fps: 60,
  rows: { south: 0, north: 1 },
  frame: { width: SOURCE.width, height: SOURCE.height + LIFT },
  anchor: { x: 32, y: 61 + LIFT },
  ballHeight: { south: 66, north: 63 },
};

const channelsOf = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
const SKIN = SPRITE_KIT.skin.map(channelsOf);
const LINE = channelsOf(SHEET_OUTLINE);

function cellOf(pixels, { column, row }) {
  const { width, height } = THROW_ANIMATION.frame;
  const at = (x, y) => ((row * height + y) * pixels.width + column * width + x) * 4;
  const inside = (x, y) => x >= 0 && y >= 0 && x < width && y < height;

  return {
    inside,
    opaque: (x, y) => inside(x, y) && pixels.data[at(x, y) + 3] > 0,
    isLine: (x, y) => LINE.every((value, i) => pixels.data[at(x, y) + i] === value),
    paint: (x, y, rgb) => {
      if (inside(x, y)) {
        pixels.data.set([...rgb, 255], at(x, y));
      }
    },
    clear: (x, y) => pixels.data.fill(0, at(x, y), at(x, y) + 4),
  };
}

function takeOffArms(cell, arms) {
  const cleared = [];

  for (let y = arms.rows[0] + LIFT; y <= arms.rows[1] + LIFT; y += 1) {
    for (let x = 0; x < SOURCE.width; x += 1) {
      if ((x <= arms.left || x >= arms.right) && cell.opaque(x, y)) {
        cell.clear(x, y);
        cleared.push([x, y]);
      }
    }
  }

  return cleared;
}

// an arm is a line three pixels thick, lit from the top left
function paintSegment(cell, [from, to], painted) {
  const steps = Math.max(Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1]), 1);

  for (let i = 0; i <= steps; i += 1) {
    const x = Math.round(from[0] + ((to[0] - from[0]) * i) / steps);
    const y = Math.round(from[1] + ((to[1] - from[1]) * i) / steps);

    for (const [dx, shade] of [
      [-1, 3],
      [0, 2],
      [1, 1],
    ]) {
      for (const dy of [-1, 0, 1]) {
        cell.paint(x + dx, y + dy, SKIN[shade]);
        painted.push([x + dx, y + dy]);
      }
    }
  }
}

// a new arm is outlined, and so is the body where an old one came off
function outline(cell, painted, cleared) {
  const around = (x, y) => NEIGHBOURS.map(([dx, dy]) => [x + dx, y + dy]);
  const bareBody = (x, y) => cell.opaque(x, y) && !cell.isLine(x, y);
  const edges = [
    ...painted.flatMap(([x, y]) => around(x, y)).filter(([x, y]) => !cell.opaque(x, y)),
    ...cleared.filter(([x, y]) => !cell.opaque(x, y) && around(x, y).some((at) => bareBody(...at))),
  ];

  for (const [x, y] of edges) {
    if (cell.inside(x, y)) {
      cell.paint(x, y, LINE);
    }
  }
}

function drawArms(pixels, { way, pose, row, column }) {
  const cell = cellOf(pixels, { column, row });
  const cleared = takeOffArms(cell, SHEET_ARMS[way]);
  const painted = [];

  for (const [shoulder, elbow, hand] of THROW_ARMS[way][pose]) {
    paintSegment(cell, [shoulder, elbow], painted);
    paintSegment(cell, [elbow, hand], painted);
  }

  outline(cell, painted, cleared);
}

// the sheet, two poses by two ways; null with no canvas to paint it on or a source sheet missing
export function throwSheet(images, createCanvas) {
  if (!createCanvas || !images?.idle || !images?.celebrate) {
    return null;
  }

  const { width, height } = THROW_ANIMATION.frame;
  const canvas = createCanvas(width * POSES.length, height * WAYS.length);
  // read back once here and drawn only into the canvases each look is recoloured on
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const cells = WAYS.flatMap((way, row) =>
    POSES.map((pose, column) => ({ way, pose, row, column })),
  );

  for (const { way, row, column } of cells) {
    const source = SHEET_ARMS[way];

    context.drawImage(
      images[source.image],
      source.x,
      source.y,
      SOURCE.width,
      SOURCE.height,
      column * width,
      row * height + LIFT,
      SOURCE.width,
      SOURCE.height,
    );
  }

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);

  cells.forEach((cell) => drawArms(pixels, cell));
  context.putImageData(pixels, 0, 0);

  return canvas;
}

// the loaded sprites with the throw-in made from them, when it can be
export function withThrowPose(sprites, createCanvas) {
  const sheet = throwSheet(sprites?.images, createCanvas);

  if (!sheet) {
    return sprites;
  }

  const { manifest, images } = sprites;

  return {
    manifest: { ...manifest, animations: { ...manifest.animations, throw: THROW_ANIMATION } },
    images: { ...images, throw: sheet },
  };
}
