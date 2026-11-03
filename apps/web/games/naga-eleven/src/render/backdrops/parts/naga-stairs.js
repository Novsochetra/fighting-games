import { mixes } from '../dither.js';
import { hash } from '../hash.js';
import { hline, plot } from '../raster.js';

// Temple steps climbing away from us between two naga balustrades, the serpents' bodies running
// up the edges on low posts and rearing at the foot into fans of seven heads. `stairs` =
// { bottom: { y, left, right }, top: { y, left, right } }; `colors` = { stone: [deep .. lit] }.

export const edgeAt = (stairs, y) => {
  const along = (y - stairs.top.y) / (stairs.bottom.y - stairs.top.y);

  return {
    along,
    left: stairs.top.left + (stairs.bottom.left - stairs.top.left) * along,
    right: stairs.top.right + (stairs.bottom.right - stairs.top.right) * along,
  };
};

function stepRows(stairs) {
  const rows = [];
  let y = stairs.top.y;
  let rise = 2;

  while (y < stairs.bottom.y) {
    rows.push({ y, rise: Math.round(rise) });
    y += Math.round(rise);
    rise *= 1.07;
  }

  return rows;
}

export function paintStairs(raster, { stairs, colors }) {
  const stone = colors.stone;

  stepRows(stairs).forEach(({ y, rise }, index) => {
    for (let row = y; row < Math.min(y + rise, stairs.bottom.y); row += 1) {
      const { left, right } = edgeAt(stairs, row);
      const tread = row - y < Math.max(1, Math.floor(rise * 0.3));

      for (let x = Math.round(left); x <= Math.round(right); x += 1) {
        const joint =
          hash(index, Math.floor((x - left) / (6 + rise * 2))) > 0.5 &&
          Math.round((x - left) % (6 + rise * 2)) === 0;
        const lit = (x - left) / (right - left) < 0.55 ? 1 : 0;

        plot(
          raster,
          x,
          row,
          tread ? stone[5 + lit] : stone[joint ? 1 : 3 + Number(mixes(x, row, lit * 0.6))],
        );
      }
    }
  });
}

function paintTube(raster, { x, y, width, stone }) {
  for (let across = 0; across < width; across += 1) {
    const share = across / Math.max(1, width - 1);
    const scale = (x + across + y) % 3 === 0 && share > 0.3;

    const tone = share < 0.35 ? 6 : 4;

    plot(
      raster,
      x + across,
      y - Math.round(width / 2) + Math.round(share * width),
      stone[scale && tone === 4 ? 2 : tone],
    );
  }
}

// a naga's body along one edge of the steps; `side` -1 runs up the left edge, 1 the right
export function paintNagaRail(raster, { stairs, side, colors }) {
  const stone = colors.stone;

  for (let y = stairs.top.y; y < stairs.bottom.y - 6; y += 1) {
    const edge = edgeAt(stairs, y);
    const width = Math.round(3 + edge.t * 6);
    const x = Math.round(side < 0 ? edge.left - width : edge.right);
    const lift = Math.round(2 + edge.t * 6);

    paintTube(raster, { x, y: y - lift, width, stone });

    if (y % Math.max(3, Math.round(4 + edge.t * 10)) === 0) {
      hline(
        raster,
        { x: x + 1, y: y - lift + Math.round(width / 2) + 1, length: Math.max(1, width - 2) },
        stone[1],
      );
    }
  }
}

const HOOD = { width: 29, height: 34 };
const HEAD_TOPS = [10, 5, 2, 0, 2, 5, 10];

function hoodMask() {
  const mask = Array.from({ length: HOOD.height }, () => new Array(HOOD.width).fill(''));
  const fill = (x, y, part) => {
    if (y >= 0 && y < HOOD.height && x >= 0 && x < HOOD.width) {
      mask[y][x] = part;
    }
  };

  for (let y = 9; y < HOOD.height; y += 1) {
    const half = y < 20 ? 13 - Math.max(0, y - 13) * 1.1 : 4 + (y > 28 ? 1 : 0);

    for (let x = Math.round(14 - half); x <= Math.round(14 + half); x += 1) {
      fill(x, y, y < 20 ? 'hood' : 'neck');
    }
  }

  HEAD_TOPS.forEach((top, i) => {
    const center = 2 + i * 4;

    for (let y = top; y < top + 8; y += 1) {
      [-1, 0, 1].forEach((dx) => fill(center + dx, y, y === top && dx !== 0 ? '' : `head${i}`));
    }
  });

  return mask;
}

const MASK = hoodMask();

function hoodColor(stone, { x, y, part, light }) {
  const at = (dx, dy) => MASK[y + dy]?.[x + dx] ?? '';
  const edge = [at(-1, 0), at(1, 0), at(0, -1), at(0, 1)].some(
    (next) => next !== part && !(part === 'neck' && next === 'hood'),
  );

  if (edge) {
    return stone[0];
  }

  const lit = (x - 14) * light > 0 ? 1 : 0;

  if (part.startsWith('head')) {
    const top = HEAD_TOPS[Number(part.slice(4))];

    return y === top + 3 && x === 4 * Number(part.slice(4)) + 2
      ? stone[0]
      : stone[y < top + 3 ? 6 : 4 + lit];
  }

  return stone[part === 'hood' ? 2 + lit * 2 : 3 + lit];
}

// the rearing hood of seven heads at the foot of a balustrade, `x`, `y` the foot of its neck
export function paintNagaHood(raster, { x, y, colors, light = -1 }) {
  MASK.forEach((row, line) => {
    row.forEach((part, column) => {
      if (part) {
        plot(
          raster,
          x - 14 + column,
          y - HOOD.height + line,
          hoodColor(colors.stone, { x: column, y: line, part, light }),
        );
      }
    });
  });
}
