const kept = new WeakMap();

// a map's rows as runs of one letter, worked out once a map
function runsOf(rows) {
  if (!kept.has(rows)) {
    const runs = rows.flatMap((row, y) =>
      [...row.matchAll(/([^.])\1*/g)].map((found) => ({
        x: found.index,
        y,
        width: found[0].length,
        letter: found[1],
      })),
    );

    kept.set(rows, runs);
  }

  return kept.get(rows);
}

export const mapSize = (rows, scale = 1) => ({
  width: rows[0].length * scale,
  height: rows.length * scale,
});

export function drawPixelMap(context, rows, { x, y, colours, scale = 1, flip = false }) {
  const unit = Math.max(1, Math.round(scale));
  const width = rows[0].length;
  const left = Math.round(x);
  const top = Math.round(y);

  for (const run of runsOf(rows)) {
    const colour = colours[run.letter];
    const from = flip ? width - run.x - run.width : run.x;

    if (colour) {
      context.fillStyle = colour;
      context.fillRect(left + from * unit, top + run.y * unit, run.width * unit, unit);
    }
  }
}
