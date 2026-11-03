import { GRID_SIZE } from './grid.js';
import { LEGEND } from './legend.js';

function colourOf(letter, palette) {
  return palette[LEGEND[letter]] ?? palette.outline;
}

function rowRuns(grid, y) {
  const row = grid.cells.slice(y * GRID_SIZE, (y + 1) * GRID_SIZE);
  const runs = [];
  let start = 0;

  for (let x = 1; x <= GRID_SIZE; x += 1) {
    if (x === GRID_SIZE || row[x] !== row[start]) {
      runs.push({ letter: row[start], from: start, to: x - 1 });
      start = x;
    }
  }

  return runs.filter((run) => run.letter !== null);
}

// one fillRect a run of same-coloured cells keeps a straight draw cheap
export function runsOf(grid, palette) {
  return Array.from({ length: GRID_SIZE }, (_, y) =>
    rowRuns(grid, y).map(({ letter, from, to }) => ({
      y,
      from,
      to,
      colour: colourOf(letter, palette),
    })),
  ).flat();
}

export function paintRuns(context, runs, { x, y, unit, flip }) {
  for (const run of runs) {
    const left = flip ? GRID_SIZE - 1 - run.to : run.from;

    context.fillStyle = run.colour;
    context.fillRect(x + left * unit, y + run.y * unit, (run.to - run.from + 1) * unit, unit);
  }
}
