import { PROPS, SHIRTS } from '../../../art/portraits/clothes.js';
import { GREY_TEMPLES } from '../../../art/portraits/hair.js';
import { BORA_HAIR } from '../hair/bora.js';
import { SOKHA_HAIR } from '../hair/sokha.js';
import { VANNAK_HAIR } from '../hair/vannak.js';
import { foldedArms } from '../props/arms.js';
import { cap } from '../props/cap.js';
import { glasses } from '../props/glasses.js';
import { moustache } from '../props/moustache.js';
import { whistle } from '../props/whistle.js';
import { wrinkles } from '../props/wrinkles.js';
import { zip } from '../props/zip.js';
import { BROWS, person } from './person.js';

const MAN = {
  skin: 'khmer',
  hairTone: 'black',
  head: 'adult',
  eyes: { set: 'steady', y: 26, gap: 3 },
  nose: { name: 'straight', y: 31 },
  mouth: { y: 39 },
};

export const VANNAK = person({
  ...MAN,
  clothes: SHIRTS.teacher,
  colours: { ...PROPS.cap, ...PROPS.cord },
  collar: 'shirt',
  hair: VANNAK_HAIR,
  skinDetails: [wrinkles(['smileLines'], { noseY: 31, mouthY: 39 })],
  faceProps: [moustache({ y: 37 }), cap()],
  chestProps: [whistle({ top: 49, neckHalf: 6, hangsTo: 57 })],
});

export const SOKHA = person({
  ...MAN,
  clothes: SHIRTS.tracksuit,
  colours: PROPS.glasses,
  collar: 'polo',
  brows: { y: 22, gap: 3, width: 8, look: BROWS.heavy, moods: { neutral: 'stern' } },
  mouth: { y: 39, moods: { neutral: 'stern', happy: 'smile' } },
  hair: SOKHA_HAIR,
  faceProps: [glasses({ y: 25, left: 20 })],
  chestProps: [zip({ from: 52 })],
  frontProps: [foldedArms()],
});

export const BORA = person({
  ...MAN,
  clothes: SHIRTS.nationalJacket,
  colours: GREY_TEMPLES,
  head: 'square',
  build: 'big',
  neck: 7,
  collar: 'polo',
  brows: { y: 22, gap: 3, width: 9, look: BROWS.heavy },
  nose: { name: 'strong', y: 31 },
  mouth: { y: 39, moods: { neutral: 'firm' } },
  hair: BORA_HAIR,
  skinDetails: [
    wrinkles(['forehead', 'crowsFeet', 'smileLines'], {
      foreheadY: 16,
      eyeY: 26,
      eyeLeft: 21,
      noseY: 31,
      mouthY: 39,
    }),
  ],
  chestProps: [zip({ from: 52 })],
});
