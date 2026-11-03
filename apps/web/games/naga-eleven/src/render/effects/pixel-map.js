const kept = new WeakMap();
const baked = new WeakMap();
const paletteIds = new WeakMap();

// a map's rows as runs of one code each, worked out once a map
function runsOf(map) {
  if (!kept.has(map)) {
    const runs = [];

    map.rows.forEach((row, dy) => {
      for (const found of row.matchAll(/([^.])\1*/g)) {
        runs.push({ dx: found.index, dy, length: found[0].length, code: found[1] });
      }
    });
    kept.set(map, { runs, width: Math.max(...map.rows.map((row) => row.length)) });
  }

  return kept.get(map);
}

function paintRuns(context, map, { left, top, palette, flip, flipY }) {
  const { runs, width } = runsOf(map);
  const height = map.rows.length;

  for (const run of runs) {
    const colour = palette[run.code];

    if (colour) {
      context.fillStyle = colour;
      context.fillRect(
        left + (flip ? width - run.dx - run.length : run.dx),
        top + (flipY ? height - 1 - run.dy : run.dy),
        run.length,
        1,
      );
    }
  }
}

let nextPaletteId = 0;

function idOf(palette) {
  if (!paletteIds.has(palette)) {
    nextPaletteId += 1;
    paletteIds.set(palette, nextPaletteId);
  }

  return paletteIds.get(palette);
}

// the map painted once on a canvas of its own for each colouring and way round, then drawn whole
function bakedOf(map, { palette, flip, flipY, bake }) {
  const forMap = baked.get(map) ?? new Map();
  const key = `${idOf(palette)}:${flip}:${flipY}`;

  if (!forMap.has(key)) {
    const canvas = bake(runsOf(map).width, map.rows.length);

    paintRuns(canvas.getContext('2d'), map, { left: 0, top: 0, palette, flip, flipY });
    forMap.set(key, canvas);
    baked.set(map, forMap);
  }

  return forMap.get(key);
}

// a little picture drawn from its rows of codes: `palette` turns a code to a colour (a code it has
// none for is left out), its `anchor` pixel lands on x, y; `flip` mirrors it left to right and
// `flipY` top to bottom. Given `bake` (a canvas maker), it is painted once and drawn as one image
export function paintMap(context, map, { x, y, palette, flip = false, flipY = false, bake }) {
  const { width } = runsOf(map);
  const height = map.rows.length;
  const left = Math.round(x) - (flip ? width - 1 - map.anchor.x : map.anchor.x);
  const top = Math.round(y) - (flipY ? height - 1 - map.anchor.y : map.anchor.y);

  if (bake) {
    context.drawImage(bakedOf(map, { palette, flip, flipY, bake }), left, top);
  } else {
    paintRuns(context, map, { left, top, palette, flip, flipY });
  }
}
