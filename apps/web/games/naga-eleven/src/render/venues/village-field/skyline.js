import { columnOf } from '../layers/frame.js';
import { hash2 } from '../kit/hash.js';
import { paintSugarPalm } from '../scenery/palm.js';
import { paintStiltHouse } from '../scenery/house.js';
import { paintRoundTree, paintTreeLine } from '../scenery/tree.js';
import { paintWat } from '../scenery/wat.js';

// the far edge of the paddies: stilt houses among leafy trees, sugar palms standing tall over all
function paintHomes(raster, { frame, layout, art, base }) {
  for (let x = -300; x < layout.pitch.length + 300; x += 37) {
    const seed = hash2(x, 3, 11);
    const column = columnOf(frame, x) + Math.round(seed * 12);
    const size = Math.round(seed * 30);

    if (seed < 0.35) {
      const tree = { x: column, base, height: 30 + size, width: 26 + Math.round(seed * 20) };

      paintRoundTree(raster, tree, { trunk: art.wood, leaf: art.tree });
    } else if (seed < 0.55) {
      const roof = seed < 0.45 ? 'thatch' : 'tin';

      paintStiltHouse(raster, { x: column, base: base + 1, width: 38 + size, roof }, art);
    }
  }
}

function paintPalms(raster, { frame, layout, art, base }) {
  for (let x = -260; x < layout.pitch.length + 300; x += 71) {
    const seed = hash2(x, 5, 11);
    const palm = {
      x: columnOf(frame, x) + Math.round(seed * 30),
      base,
      height: 50 + Math.round(seed * 40),
      crown: 11 + Math.round(seed * 4),
    };

    if (seed < 0.75) {
      paintSugarPalm(raster, palm, art.palm);
    }
  }
}

function paintVillageRow(raster, job) {
  const place = { ...job, base: raster.height - 1 };

  paintHomes(raster, place);
  paintPalms(raster, place);
}

export function villageRow(layout, art) {
  return {
    depth: -196,
    height: 'toTop',
    paint: (raster, frame) => paintVillageRow(raster, { frame, layout, art }),
  };
}

// far off over the trees: a hazy line of more trees, and a pagoda's spire
export function distantTrees(layout, art) {
  return {
    depth: -900,
    base: -196,
    height: 70,
    paint: (raster, frame) => {
      paintTreeLine(raster, { bottom: raster.height, height: 26, salt: 2 }, art.haze);
      paintWat(
        raster,
        { x: columnOf(frame, layout.pitch.length * 0.64), base: raster.height - 12 },
        art.wat,
      );
    },
  };
}
