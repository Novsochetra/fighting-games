import { cellAt, setCell } from '../grid.js';

const NEIGHBOURS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

// a cloth laid over the body needs its own edge, since the frame's outline only rings the outside
export function paintPatch(grid, cells, letterAt) {
  const inPatch = new Set(cells.map(([x, y]) => `${x},${y}`));
  const onEdge = ([x, y]) =>
    NEIGHBOURS.some(
      ([dx, dy]) => !inPatch.has(`${x + dx},${y + dy}`) && cellAt(grid, x + dx, y + dy),
    );
  const edges = cells.filter(onEdge);

  cells.forEach(([x, y]) => setCell(grid, x, y, letterAt(x, y)));
  edges.forEach(([x, y]) => setCell(grid, x, y, 'O'));
}

export function spanCells(spans) {
  return spans.flatMap(([y, from, to]) =>
    Array.from({ length: to - from + 1 }, (_, i) => [from + i, y]),
  );
}
