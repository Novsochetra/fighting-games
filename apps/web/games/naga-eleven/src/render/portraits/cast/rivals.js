import { GLOVES, KEEPER_SHIRTS, PROPS, SHIRTS } from '../../../art/portraits/clothes.js';
import { FARHAD_HAIR } from '../hair/farhad.js';
import { HARUTO_HAIR } from '../hair/haruto.js';
import { LUKAS_HAIR } from '../hair/lukas.js';
import { MINJUN_HAIR } from '../hair/minjun.js';
import { RAFAEL_HAIR } from '../hair/rafael.js';
import { beard } from '../props/beard.js';
import { gloves } from '../props/gloves.js';
import { headband } from '../props/headband.js';
import { BROWS, person } from './person.js';

export const HARUTO = person({
  skin: 'eastAsian',
  hairTone: 'black',
  iris: 'dark',
  clothes: SHIRTS.japan,
  collar: 'vee',
  eyes: { set: 'sharp', y: 26, gap: 3 },
  mouth: { y: 38, moods: { neutral: 'tight' } },
  hair: HARUTO_HAIR,
});

export const MINJUN = person({
  skin: 'eastAsian',
  hairTone: 'black',
  iris: 'dark',
  clothes: SHIRTS.korea,
  eyes: { set: 'intense', y: 25, gap: 3 },
  brows: { y: 23, gap: 3, width: 8, look: BROWS.heavy },
  mouth: { y: 38, moods: { neutral: 'firm' } },
  hair: MINJUN_HAIR,
});

export const FARHAD = person({
  skin: 'persian',
  hairTone: 'black',
  clothes: KEEPER_SHIRTS.iran,
  colours: GLOVES,
  head: 'long',
  build: 'big',
  neck: 7,
  eyes: { set: 'steady', y: 26, gap: 3 },
  brows: { y: 22, gap: 3, width: 9, look: BROWS.heavy },
  nose: { name: 'strong', y: 31 },
  mouth: { y: 40 },
  hair: FARHAD_HAIR,
  skinDetails: [beard({ shape: 'long', fromY: 33, mouthY: 40 })],
  frontProps: [gloves()],
});

export const RAFAEL = person({
  skin: 'brazilian',
  hairTone: 'brown',
  clothes: SHIRTS.brazil,
  colours: PROPS.headband,
  collar: 'vee',
  eyes: { set: 'round', y: 25, gap: 3 },
  mouth: { y: 38, moods: { neutral: 'beam', happy: 'laugh' } },
  hair: RAFAEL_HAIR,
  faceProps: [headband()],
});

export const LUKAS = person({
  skin: 'german',
  hairTone: 'blond',
  iris: 'blue',
  clothes: SHIRTS.germany,
  head: 'square',
  neck: 7,
  eyes: { set: 'steady', y: 26, gap: 3 },
  brows: { y: 22, gap: 3, width: 9, look: BROWS.heavy },
  nose: { name: 'strong', y: 31 },
  mouth: { y: 39, moods: { neutral: 'stern' } },
  hair: LUKAS_HAIR,
});
