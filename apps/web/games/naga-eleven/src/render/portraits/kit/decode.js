// the skin's letters are digits, which would read as counts, so the bake stores them as a to d
const STORED = { a: '1', b: '2', c: '3', d: '4' };

const RUN = /(\D)(\d*)/g;

function rowCells(row, width) {
  const cells = [];

  for (const [, letter, count] of row.matchAll(RUN)) {
    const cell = letter === '.' ? null : (STORED[letter] ?? letter);

    cells.push(...new Array(Number(count || 1)).fill(cell));
  }

  return [...cells, ...new Array(width - cells.length).fill(null)];
}

export function decodePart(text) {
  const [head, body] = text.split('|');
  const [width, height, x, y] = head.split(' ').map(Number);
  const rows = body.split('/').map((row) => rowCells(row, width));

  return { width, height, anchor: { x, y }, cells: rows.flat().slice(0, width * height) };
}

export function cellOf(part, x, y) {
  return x >= 0 && y >= 0 && x < part.width && y < part.height
    ? part.cells[y * part.width + x]
    : null;
}
