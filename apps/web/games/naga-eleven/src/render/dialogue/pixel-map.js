// one art pixel of the dialogue's frame, plate and cues is this many canvas pixels, as the
// portraits are drawn at
export const ART = 2;

export const mapWidth = (map) => map[0].length;

export const mapHeight = (map) => map.length;

// a row of a map as runs of one colour, so a frame is laid with a rect a run, not a pixel
function runsOf(row) {
  const runs = [];
  let start = 0;

  for (let i = 1; i <= row.length; i += 1) {
    if (row[i] !== row[start]) {
      runs.push({ key: row[start], start, length: i - start });
      start = i;
    }
  }

  return runs.filter((run) => run.key !== '.');
}

const flipped = (map, { flipX, flipY }) => {
  const rows = flipY ? [...map].reverse() : map;

  return flipX ? rows.map((row) => [...row].reverse().join('')) : rows;
};

// `x`, `y` in canvas pixels; `colors` maps each letter of the map to a colour, '.' is left clear
export function drawPixelMap(context, map, { x, y, colors, flipX = false, flipY = false }) {
  flipped(map, { flipX, flipY }).forEach((row, line) => {
    for (const run of runsOf(row)) {
      context.fillStyle = colors[run.key];
      context.fillRect(
        Math.round(x + run.start * ART),
        Math.round(y + line * ART),
        run.length * ART,
        ART,
      );
    }
  });
}

export function fillArt(context, color, { x, y, width, height }) {
  context.fillStyle = color;
  context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}
