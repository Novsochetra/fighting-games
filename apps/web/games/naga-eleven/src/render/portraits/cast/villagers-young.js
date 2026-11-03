import { PROPS, VILLAGER_SHIRTS } from '../../../art/portraits/clothes.js';
import { BUZZ_HAIR } from '../hair/buzz.js';
import { LONG_HAIR_BACK } from '../hair/long-back.js';
import { LONG_HAIR } from '../hair/long.js';
import { MOP_HAIR } from '../hair/mop.js';
import { PIGTAILS_HAIR } from '../hair/pigtails.js';
import { flower } from '../props/flower.js';
import { plaid } from '../props/plaid.js';
import { plaster } from '../props/plaster.js';
import { BROWS, person } from './person.js';

const CHILD = {
  head: 'child',
  lift: 4,
  build: 'child',
  neck: 5,
  ears: 26,
  eyes: { set: 'round', y: 26, gap: 3 },
  brows: { y: 23, gap: 3, width: 7, look: BROWS.thick },
  nose: { name: 'button', y: 33 },
  mouth: { y: 37 },
};

export const CHILD_BOY = person({
  skin: 'khmer',
  hairTone: 'black',
  clothes: VILLAGER_SHIRTS.lime,
  colours: PROPS.plaster,
  ...CHILD,
  mouth: { y: 37, moods: { neutral: 'smile' } },
  hair: BUZZ_HAIR,
  faceProps: [plaster({ x: 21, y: 34 })],
});

export const CHILD_GIRL = person({
  skin: 'khmer',
  hairTone: 'black',
  clothes: VILLAGER_SHIRTS.rose,
  colours: PROPS.ribbon,
  ...CHILD,
  brows: { y: 23, gap: 3, width: 6, look: BROWS.thin },
  hair: PIGTAILS_HAIR,
});

export const YOUNG_MAN = person({
  skin: 'khmer',
  hairTone: 'black',
  clothes: VILLAGER_SHIRTS.flannel,
  head: 'young',
  collar: 'shirt',
  eyes: { set: 'soft', y: 25, gap: 3 },
  nose: { name: 'broad', y: 31 },
  mouth: { y: 38, moods: { neutral: 'smile' } },
  hair: MOP_HAIR,
  chestProps: [plaid({ from: 50 })],
});

export const YOUNG_WOMAN = person({
  skin: 'khmerLight',
  hairTone: 'black',
  clothes: VILLAGER_SHIRTS.lavender,
  colours: PROPS.flower,
  head: 'woman',
  build: 'woman',
  neck: 5,
  eyes: { set: 'soft', y: 25, gap: 3 },
  brows: { y: 22, gap: 3, width: 7, look: BROWS.thin },
  nose: { name: 'button', y: 32 },
  mouth: { y: 37, moods: { neutral: 'smile' } },
  hair: LONG_HAIR,
  backHair: LONG_HAIR_BACK,
  faceProps: [flower({ x: 41, y: 12 })],
});
