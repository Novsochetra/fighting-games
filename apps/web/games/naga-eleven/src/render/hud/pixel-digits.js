import { COMBO_GLYPHS, HUD } from '../../art/hud.js';

const kept = new Map();

// the stretches of a run with nothing lit over them, which catch the light along their tops
function litRunsOf(above, found) {
  const stretches = [];

  for (let i = 0; i < found[0].length; i += 1) {
    const isOpen = above[found.index + i] !== '#';
    const last = stretches.at(-1);

    if (isOpen && last && last.from + last.length === i) {
      last.length += 1;
    } else if (isOpen) {
      stretches.push({ from: i, length: 1 });
    }
  }

  return stretches;
}

// a glyph's runs of lit cells, and the cells of each run with nothing over them, row by row
function runsOf(letter) {
  if (!kept.has(letter)) {
    const rows = COMBO_GLYPHS[letter] ?? COMBO_GLYPHS[1];
    const runs = rows.flatMap((row, dy) =>
      [...row.matchAll(/#+/g)].map((found) => ({
        dx: found.index,
        dy,
        length: found[0].length,
        lit: litRunsOf(rows[dy - 1] ?? '', found),
      })),
    );

    kept.set(letter, { runs, width: rows[0].length, height: rows.length });
  }

  return kept.get(letter);
}

// the light top rows step down the ramp to its deep end at the foot
const shadeOf = (ramp, row, height) => ramp[3 - Math.min(2, Math.floor((row / height) * 3))];

function paintRuns(context, { runs, x, y, cell, colour, grow, drop }) {
  context.fillStyle = colour;

  for (const run of runs) {
    context.fillRect(
      x + run.dx * cell - grow,
      y + run.dy * cell - grow,
      run.length * cell + grow * 2,
      cell + grow * 2 + drop,
    );
  }
}

function paintFace(context, { runs, height, x, y, cell, ramp }) {
  for (const run of runs) {
    const left = x + run.dx * cell;
    const top = y + run.dy * cell;

    context.fillStyle = shadeOf(ramp, run.dy, height);
    context.fillRect(left, top, run.length * cell, cell);
    context.fillStyle = ramp[3];

    for (const stretch of run.lit) {
      context.fillRect(left + stretch.from * cell, top, stretch.length * cell, 1);
    }
  }
}

// one glyph of the counter, `cell` pixels to its cell, its foot at `bottom`: an ink outline,
// a pixel deeper at its foot so it stands off the pitch, and its face in `ramp` (deep to light);
// returns how wide it was
export function drawGlyph(context, { letter, x, bottom, cell, ramp }) {
  const { runs, width, height } = runsOf(letter);
  const at = { runs, x: Math.round(x), y: Math.round(bottom - height * cell), cell };

  paintRuns(context, { ...at, colour: HUD.ink, grow: 1, drop: 1 });
  paintFace(context, { ...at, height, ramp });

  return width * cell;
}

// "x3": the times sign smaller, sat on the digit's foot
export function drawLevel(context, { level, x, bottom, cell, ramp }) {
  const times = drawGlyph(context, {
    letter: 'x',
    x,
    bottom,
    cell: Math.max(1, cell - 1),
    ramp,
  });

  return (
    times + 2 + drawGlyph(context, { letter: String(level), x: x + times + 2, bottom, cell, ramp })
  );
}

export const levelWidth = (cell) => 5 * Math.max(1, cell - 1) + 2 + 5 * cell;
