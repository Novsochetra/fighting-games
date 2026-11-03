import { MIST_MASK_INK } from '../../../art/backdrops/mist.js';
import { VILLAGE_DUSK_ART } from '../../../art/backdrops/village.js';
import { colorOf, createRaster } from '../raster.js';
import { paintVillage } from './village.js';

// what stands up out of the fields, nearer than the mist lying on them: the house, the grove and
// the banana plants, the palms, the fence, the ball and the hedges along the far paddies. The path
// and the dikes lie flat, so the mist lies over them.
const STANDING = ['shadow', 'rim', 'roof', 'window', 'lamp', 'bamboo', 'ball', 'hazeNear'];

const inked = (value) => (Array.isArray(value) ? value.map(() => MIST_MASK_INK) : MIST_MASK_INK);

function maskOf(raster) {
  const [red, green, blue] = colorOf(MIST_MASK_INK);
  const standing = new Uint8Array(raster.width * raster.height);

  for (let i = 0; i < standing.length; i += 1) {
    const at = i * 4;

    standing[i] =
      raster.data[at] === red && raster.data[at + 1] === green && raster.data[at + 2] === blue
        ? 1
        : 0;
  }

  return standing;
}

let kept = null;

// the dawn and the dusk village stand the same things in the same places; painted once, on the
// first frame the mist is drawn
export function villageMistMask() {
  if (!kept) {
    const art = { ...VILLAGE_DUSK_ART };
    const raster = createRaster();

    STANDING.forEach((key) => {
      art[key] = inked(art[key]);
    });
    paintVillage(raster, { art, frame: 0, dawn: false });

    const standing = maskOf(raster);

    kept = (x, y) => x >= 0 && x < raster.width && standing[y * raster.width + x] === 1;
  }

  return kept;
}
