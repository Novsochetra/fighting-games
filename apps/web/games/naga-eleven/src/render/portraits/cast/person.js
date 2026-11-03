import { PORTRAIT_BASE } from '../../../art/portraits/base.js';
import { HAIRS, IRISES } from '../../../art/portraits/hair.js';
import { SKINS } from '../../../art/portraits/skin.js';

export const BROWS = {
  thick: { top: 'k', under: 'g', thickness: 2, taper: 2 },
  heavy: { top: 'k', under: 'k', thickness: 2, taper: 1 },
  thin: { top: 'k', under: 'g', thickness: 1, taper: 0 },
  white: { top: 'H', under: 'g', thickness: 2, taper: 1 },
};

const LOOK = {
  head: 'young',
  build: 'broad',
  neck: 6,
  collar: 'crew',
  eyes: { set: 'steady', y: 25, gap: 3 },
  brows: { y: 22, gap: 3, width: 8, look: BROWS.thick },
  nose: { name: 'small', y: 32 },
  mouth: { y: 38 },
  ears: 25,
};

export function person({ skin, hairTone, iris = 'brown', clothes, colours = {}, ...look }) {
  return {
    ...LOOK,
    ...look,
    palette: {
      ...PORTRAIT_BASE,
      ...SKINS[skin],
      ...HAIRS[hairTone],
      ...IRISES[iris],
      ...clothes,
      ...colours,
    },
  };
}
