import { KRAMA, SHIRTS } from '../../../art/portraits/clothes.js';
import { NEARY_HAIR } from '../hair/neary.js';
import { TA_SOK_HAIR } from '../hair/ta-sok.js';
import { dots } from '../props/dots.js';
import { earrings } from '../props/earrings.js';
import { krama } from '../props/krama.js';
import { wrinkles } from '../props/wrinkles.js';
import { BROWS, person } from './person.js';

export const NEARY = person({
  skin: 'khmerLight',
  hairTone: 'softBlack',
  clothes: SHIRTS.blouse,
  head: 'woman',
  build: 'woman',
  neck: 5,
  eyes: { set: 'soft', y: 25, gap: 3 },
  brows: { y: 22, gap: 3, width: 7, look: BROWS.thin },
  nose: { name: 'button', y: 32 },
  mouth: { y: 37, moods: { neutral: 'smile' } },
  hair: NEARY_HAIR,
  chestProps: [dots({ from: 53 })],
  faceProps: [earrings({ x: 17, y: 31 })],
});

export const TA_SOK = person({
  skin: 'khmerDeep',
  hairTone: 'white',
  clothes: SHIRTS.cream,
  colours: KRAMA,
  head: 'elder',
  collar: 'plain',
  eyes: { set: 'elder', y: 26, gap: 3 },
  brows: { y: 22, gap: 3, width: 8, look: BROWS.white },
  nose: { name: 'broad', y: 31 },
  mouth: { y: 38, moods: { neutral: 'smile' } },
  hair: TA_SOK_HAIR,
  skinDetails: [
    wrinkles(['forehead', 'crowsFeet', 'smileLines', 'underEyes'], {
      foreheadY: 15,
      eyeY: 26,
      eyeLeft: 22,
      eyeHeight: 4,
      noseY: 31,
      mouthY: 38,
    }),
  ],
  chestProps: [krama({ top: 48, neckHalf: 6 })],
});
