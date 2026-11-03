import { cellAt, setCell, stampBothSides } from './grid.js';
import { SKIN_LETTERS } from './legend.js';

export const NECK_BELOW = 8;

const CLOTH = new Set(['A', 'B', 'C', 'D']);

const FLAPS = {
  shirt: ['AAO....', 'OAAAO..', '.OAAAO.', '..OAAB.', '...OBO.', '....O..'],
  polo: ['TTO...', 'OTTTO.', '.OTTU.', '..OUO.', '...O..'],
  jacket: ['BBO.....', 'BBBO....', 'OBBBO...', '.OABBO..', '..OABBO.', '...OABO.', '....OBBO'],
};

// how far the opening reaches across, as a share of the neck, at a share of the way down
const OPENINGS = {
  round: (down) => 1 - down * down,
  vee: (down) => 1 - down,
};

function inOpening({ x, y, top, neckHalf, depth, shape }) {
  const down = (y - top + 1) / (depth + 1);
  const across = Math.abs(x - 31.5) / (neckHalf + 0.5);

  return down < 1 && across <= OPENINGS[shape](Math.max(0, down));
}

function cutOpening(grid, { top, neckHalf, depth, shape }) {
  for (let y = top - 1; y <= top + NECK_BELOW; y += 1) {
    for (let x = 32 - neckHalf; x <= 31 + neckHalf; x += 1) {
      if (
        SKIN_LETTERS.has(cellAt(grid, x, y)) &&
        !inOpening({ x, y, top, neckHalf, depth, shape })
      ) {
        setCell(grid, x, y, 'B');
      }
    }
  }
}

function touchesSkin(grid, x, y) {
  return [-1, 0, 1].some((dy) =>
    [-1, 0, 1].some((dx) => SKIN_LETTERS.has(cellAt(grid, x + dx, y + dy))),
  );
}

function trimOpening(grid, { top, depth, neckHalf }) {
  const ring = [];

  for (let y = top - 2; y <= top + depth + 2; y += 1) {
    for (let x = 30 - neckHalf; x <= 33 + neckHalf; x += 1) {
      if (CLOTH.has(cellAt(grid, x, y)) && touchesSkin(grid, x, y)) {
        ring.push([x, y]);
      }
    }
  }

  ring.forEach(([x, y]) => setCell(grid, x, y, x < 32 ? 'T' : 'U'));
}

export function paintCollar(grid, { kind, top, neckHalf }) {
  const shape = kind === 'vee' || kind === 'jacket' ? 'vee' : 'round';
  const depth = shape === 'vee' ? 7 : 4;

  cutOpening(grid, { top, neckHalf, depth, shape });

  if (kind !== 'plain') {
    trimOpening(grid, { top, depth, neckHalf });
  }

  if (FLAPS[kind]) {
    stampBothSides(grid, FLAPS[kind], { x: 32 - neckHalf - 4, y: top - 2 });
  }
}
