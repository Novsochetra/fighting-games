// a sprite is rows of letters, each letter a colour of `colors`; any other letter is see-through
export function drawSprite(context, rows, colors, { x, y }) {
  rows.forEach((row, rowIndex) => {
    for (let column = 0; column < row.length; column++) {
      const color = colors[row[column]];

      if (color) {
        context.fillStyle = color;
        context.fillRect(x + column, y + rowIndex, 1, 1);
      }
    }
  });
}
