// the skin's letters are digits, which would read as counts, so the bake stores them as a to d
const STORED = { a: '1', b: '2', c: '3', d: '4' };

const RUN = /(\D)(\d*)/g;

function rowCells(row, width, stored) {
  const cells = [];

  for (const [, letter, count] of row.matchAll(RUN)) {
    const cell = letter === '.' ? null : (stored[letter] ?? letter);

    cells.push(...new Array(Number(count || 1)).fill(cell));
  }

  return [...cells, ...new Array(width - cells.length).fill(null)];
}

// the effects' codes have no digits, so their `d` is their own: they decode with `stored` empty
export function decodePart(text, stored = STORED) {
  const [head, body] = text.split('|');
  const [width, height, x, y] = head.split(' ').map(Number);
  const rows = body.split('/').map((row) => rowCells(row, width, stored));

  return { width, height, anchor: { x, y }, cells: rows.flat().slice(0, width * height) };
}

export function cellOf(part, x, y) {
  return x >= 0 && y >= 0 && x < part.width && y < part.height
    ? part.cells[y * part.width + x]
    : null;
}
