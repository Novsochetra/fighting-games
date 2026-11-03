// a sprite as rows of characters, each a key into its palette; '.' and ' ' are clear
export function drawGrid(pen, { rows, palette, x, y, flip = false, size = 1 }) {
  const width = Math.max(...rows.map((row) => row.length));

  rows.forEach((row, rowIndex) => {
    let start = 0;

    for (let i = 1; i <= row.length; i += 1) {
      if (i === row.length || row[i] !== row[start]) {
        drawRun(pen, {
          key: row[start],
          from: start,
          to: i,
          rowIndex,
          palette,
          x,
          y,
          flip,
          size,
          width,
        });
        start = i;
      }
    }
  });
}

function drawRun(pen, { key, from, to, rowIndex, palette, x, y, flip, size, width }) {
  const color = palette[key];

  if (!color) {
    return;
  }

  const left = flip ? width - to : from;

  pen.rect([x + left * size, y + rowIndex * size, (to - from) * size, size], color);
}

export const gridSize = (rows) => ({
  width: Math.max(...rows.map((row) => row.length)),
  height: rows.length,
});
