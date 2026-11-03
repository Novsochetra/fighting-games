import { plot } from '../raster.js';
import { ring } from '../shapes.js';

// The cup: a deep bowl on a stem with a knot, a handle either side and a two-step plinth, all
// in gold lit from the top left. `x` is its middle, `y` the rim of the bowl; `gold` runs dark to
// white, six steps.

function goldAt(gold, across) {
  if (across < -0.62) {
    return gold[3];
  }

  if (across < -0.32) {
    return gold[across < -0.45 ? 5 : 4];
  }

  if (across < 0.35) {
    return gold[3];
  }

  return gold[across < 0.7 ? 2 : 1];
}

function paintTurned(raster, { x, top, profile, gold }) {
  profile.forEach((half, row) => {
    for (let offset = -half; offset <= half; offset += 1) {
      const edge = Math.abs(offset) === half;

      plot(
        raster,
        x + offset,
        top + row,
        edge ? gold[0] : goldAt(gold, offset / Math.max(1, half)),
      );
    }
  });
}

const bowlProfile = (size) =>
  Array.from({ length: Math.round(size * 1.9) }, (_, row) => {
    const along = row / (size * 1.9);

    return Math.max(2, Math.round(size * (1 - along ** 2.4) ** 0.7));
  });

export function paintTrophy(raster, { x, y, size, gold, plinth }) {
  const bowl = bowlProfile(size);
  const stem = [3, 2, 2, 3, 4, 3, 2, 2, 2, 3, 4, 5];
  const base = Array.from({ length: 6 }, (_, i) => Math.round(size * 0.55) + Math.floor(i / 2));

  [-1, 1].forEach((side) => {
    ring(
      raster,
      { x: x + side * (size + 1), y: y + size * 0.55, radius: size * 0.42 },
      gold[side < 0 ? 4 : 2],
    );
    ring(
      raster,
      { x: x + side * (size + 1), y: y + size * 0.55, radius: size * 0.42 - 1 },
      gold[0],
    );
  });
  paintTurned(raster, { x, top: y, profile: bowl, gold });
  paintTurned(raster, { x, top: y + bowl.length, profile: stem, gold });
  paintTurned(raster, {
    x,
    top: y + bowl.length + stem.length,
    profile: base,
    gold: [plinth[0], ...plinth, plinth[2], plinth[2]],
  });

  for (let offset = -size; offset <= size; offset += 1) {
    plot(raster, x + offset, y, gold[Math.abs(offset) < size - 1 ? 5 : 0]);
  }

  return { bottom: y + bowl.length + stem.length + base.length };
}
