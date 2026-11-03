const runsByMap = new WeakMap();

function runsIn(text, row, palette) {
  const runs = [];
  let start = 0;

  for (let i = 1; i <= text.length; i += 1) {
    if (text[i] === text[start]) {
      continue;
    }

    if (text[start] !== '.') {
      runs.push({ row, x: start, width: i - start, color: palette[text[start]] });
    }

    start = i;
  }

  return runs;
}

// a map's rows are turned once into runs of one colour, so a frame paints one rect a run
function runsOf(map) {
  let runs = runsByMap.get(map);

  if (!runs) {
    runs = map.rows.flatMap((text, row) => runsIn(text, row, map.palette));
    runsByMap.set(map, runs);
  }

  return runs;
}

const STILL = { x: 0, y: 0 };

// a pixel map (src/art/training/) drawn with its anchor at x, y; `shift(row)` moves a row, for a
// breath or a rock, and `only` draws only those rows
export function drawPixelMap(context, map, { x, y, shift = () => STILL, only = null }) {
  const left = Math.round(x) - map.anchor.x;
  const top = Math.round(y) - map.anchor.y;

  for (const run of runsOf(map)) {
    if (only && !only.includes(run.row)) {
      continue;
    }

    const moved = shift(run.row);

    context.fillStyle = run.color;
    context.fillRect(left + run.x + moved.x, top + run.row + moved.y, run.width, 1);
  }
}
