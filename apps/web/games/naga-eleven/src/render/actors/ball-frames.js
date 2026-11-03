// The ball's frames are painted from a sphere: lit from the top left, its twelve dark patches
// where an icosahedron's corners point, turned a little more each frame as it rolls
const GOLDEN = (1 + Math.sqrt(5)) / 2;
const SPIN_FRAMES = 6;

const CORNERS = [
  [-1, GOLDEN, 0],
  [1, GOLDEN, 0],
  [-1, -GOLDEN, 0],
  [1, -GOLDEN, 0],
  [0, -1, GOLDEN],
  [0, 1, GOLDEN],
  [0, -1, -GOLDEN],
  [0, 1, -GOLDEN],
  [GOLDEN, 0, -1],
  [GOLDEN, 0, 1],
  [-GOLDEN, 0, -1],
  [-GOLDEN, 0, 1],
].map((corner) => corner.map((value) => value / Math.hypot(...corner)));

// codes: 0 none, 1 outline, 2-5 white deep to light, 6-7 patch dark and lit
const OUTLINE = 1;

function surfaceCode(normal, turn) {
  const [x, y, out] = normal;
  const spun = [
    x * Math.cos(turn) - y * Math.sin(turn),
    x * Math.sin(turn) + y * Math.cos(turn),
    out,
  ];
  const lit = -0.6 * x - 0.6 * y + 0.53 * out;
  const onPatch = CORNERS.some(
    (corner) => corner.reduce((sum, value, i) => sum + value * spun[i], 0) > 0.9,
  );

  if (onPatch) {
    return lit > 0.55 ? 7 : 6;
  }

  return 2 + [-0.15, 0.3, 0.7].filter((edge) => lit > edge).length;
}

function paintFrame(size, frame) {
  const codes = new Uint8Array(size * size);
  const radius = size / 2 - 0.5;
  const turn = (frame / SPIN_FRAMES) * Math.PI * 0.8;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = (x + 0.5 - size / 2) / radius;
      const ny = (y + 0.5 - size / 2) / radius;
      const edge = nx * nx + ny * ny;

      if (edge <= 1) {
        codes[y * size + x] =
          edge > 0.72 ? OUTLINE : surfaceCode([nx, ny, Math.sqrt(1 - edge)], turn);
      }
    }
  }

  return { width: size, height: size, codes };
}

const painted = new Map();

export function ballFrame(size, frame) {
  const key = size * SPIN_FRAMES + frame;

  if (!painted.has(key)) {
    painted.set(key, paintFrame(size, frame));
  }

  return painted.get(key);
}

export { SPIN_FRAMES };
