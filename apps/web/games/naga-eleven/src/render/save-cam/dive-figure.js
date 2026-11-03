import { DIVE_INKS, DIVE_KIT_LETTERS } from '../../art/save-cam/keeper-dive/index.js';
import { STAMP, STAMP_CODES, stampCodes } from '../actors/number-stamp.js';

const kept = new WeakMap();

// a map's rows as runs of one letter, worked out once a map, so a frame paints one rect a run
function runsOf(map) {
  if (!kept.has(map)) {
    const runs = map.rows.flatMap((row, y) =>
      [...row.matchAll(/([^.])\1*/g)].map((found) => ({
        x: found.index,
        y,
        width: found[0].length,
        letter: found[1],
      })),
    );

    kept.set(map, runs);
  }

  return kept.get(map);
}

// a letter of the kit takes the look's shade at the same place along its ramp, so a ramp of
// three shades wears it as well as one of four
export function colourOf(letter, look) {
  const kit = DIVE_KIT_LETTERS[letter];

  if (!kit) {
    return DIVE_INKS[letter];
  }

  const [part, shade] = kit;
  const ramp = look[part];

  return ramp?.[Math.round((shade * (ramp.length - 1)) / 3)] ?? DIVE_INKS[0];
}

export const widthOf = (map) => map.rows[0].length;

// a column of the map as drawn: diving left, the map is read from its right edge
export const columnOf = (map, x, mirror) => (mirror ? widthOf(map) - 1 - x : x);

const isShirt = (map, x, y) => DIVE_KIT_LETTERS[map.rows[y]?.[x]]?.[0] === 'shirt';

// the number from the shirt-number art, printed on his chest after the frame, never mirrored, and
// only on the shirt, so an arm across it hides it; it keeps the back's ring of the shirt's own
// shade, as the diagonal chest is small and turned and a plain digit is lost on it
function drawChestNumber(pen, { map, box, mirror, look, number }) {
  const colours = look.numberColours;

  if (!colours || !Number.isFinite(number) || number <= 0) {
    return;
  }

  const inks = { [STAMP_CODES.fill]: colours.fill, [STAMP_CODES.edge]: colours.edge };
  const codes = stampCodes(number, 'back');
  const left = columnOf(map, map.number.x, mirror) - Math.floor(STAMP.width / 2);
  const top = map.number.y - Math.floor(STAMP.height / 2);

  for (let i = 0; i < codes.length; i += 1) {
    const x = left + (i % STAMP.width);
    const y = top + Math.floor(i / STAMP.width);

    if (inks[codes[i]] && isShirt(map, columnOf(map, x, mirror), y)) {
      pen.dot(box.left + x, box.top + y, inks[codes[i]]);
    }
  }
}

// a frame of the dive with its navel (`anchor`) at x, y on the art grid, in the keeper's look
export function drawDiveFigure(pen, { map, x, y, mirror = false, look, number }) {
  const width = widthOf(map);
  const box = {
    left: Math.round(x) - columnOf(map, map.anchor.x, mirror),
    top: Math.round(y) - map.anchor.y,
  };

  for (const run of runsOf(map)) {
    const left = mirror ? width - run.x - run.width : run.x;

    pen.rect([box.left + left, box.top + run.y, run.width, 1], colourOf(run.letter, look));
  }

  drawChestNumber(pen, { map, box, mirror, look, number });
}
