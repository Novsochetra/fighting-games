import { PROPS, VILLAGER_SHIRTS } from '../../../art/portraits/clothes.js';
import { BOB_HAIR } from '../hair/bob.js';
import { CROP_HAIR } from '../hair/crop.js';
import { HORSESHOE_HAIR } from '../hair/horseshoe.js';
import { SIDES_HAIR } from '../hair/sides.js';
import { baldShine } from '../props/bald.js';
import { dots } from '../props/dots.js';
import { strawHat } from '../props/straw-hat.js';
import { wrinkles } from '../props/wrinkles.js';
import { BROWS, person } from './person.js';

const WOMAN = {
  head: 'woman',
  build: 'woman',
  neck: 5,
  eyes: { set: 'soft', y: 25, gap: 3 },
  brows: { y: 22, gap: 3, width: 7, look: BROWS.thin },
  nose: { name: 'button', y: 32 },
  mouth: { y: 37, moods: { neutral: 'smile' } },
};

const AGED = { eyeY: 26, eyeLeft: 22, eyeHeight: 6, noseY: 31, mouthY: 38 };

export const ADULT_MAN = person({
  skin: 'khmerDeep',
  hairTone: 'black',
  clothes: VILLAGER_SHIRTS.farmer,
  colours: PROPS.strawHat,
  head: 'adult',
  collar: 'shirt',
  eyes: { set: 'steady', y: 26, gap: 3 },
  nose: { name: 'broad', y: 31 },
  mouth: { y: 39, moods: { neutral: 'smile' } },
  hair: SIDES_HAIR,
  skinDetails: [wrinkles(['smileLines'], { noseY: 31, mouthY: 39 })],
  faceProps: [strawHat()],
});

export const ADULT_WOMAN = person({
  skin: 'khmer',
  hairTone: 'softBlack',
  clothes: VILLAGER_SHIRTS.coral,
  ...WOMAN,
  hair: BOB_HAIR,
  chestProps: [dots({ from: 52 })],
});

export const ELDER_MAN = person({
  skin: 'khmer',
  hairTone: 'grey',
  clothes: VILLAGER_SHIRTS.khaki,
  head: 'elder',
  collar: 'shirt',
  eyes: { set: 'elder', y: 26, gap: 3 },
  brows: { y: 22, gap: 3, width: 8, look: BROWS.white },
  nose: { name: 'wide', y: 31 },
  mouth: { y: 38, moods: { neutral: 'smile' } },
  hair: HORSESHOE_HAIR,
  skinDetails: [
    baldShine({ y: 10 }),
    wrinkles(['forehead', 'crowsFeet', 'smileLines'], { ...AGED, foreheadY: 16, eyeHeight: 4 }),
  ],
});

export const ELDER_WOMAN = person({
  skin: 'khmerLight',
  hairTone: 'grey',
  clothes: VILLAGER_SHIRTS.indigo,
  ...WOMAN,
  head: 'elder',
  eyes: { set: 'soft', y: 26, gap: 3 },
  nose: { name: 'small', y: 31 },
  mouth: { y: 38, moods: { neutral: 'smile' } },
  hair: CROP_HAIR,
  skinDetails: [wrinkles(['crowsFeet', 'smileLines', 'underEyes'], AGED)],
  chestProps: [dots({ from: 51 })],
});
