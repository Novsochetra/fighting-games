import { PROPS, SHIRTS } from '../../../art/portraits/clothes.js';
import { ANNOUNCER_HAIR } from '../hair/announcer.js';
import { headset } from '../props/headset.js';
import { tie } from '../props/tie.js';
import { person } from './person.js';

export const ANNOUNCER = person({
  skin: 'khmer',
  hairTone: 'black',
  clothes: SHIRTS.suit,
  colours: { ...PROPS.headset, ...PROPS.tie },
  head: 'adult',
  collar: 'jacket',
  eyes: { set: 'steady', y: 26, gap: 3 },
  nose: { name: 'straight', y: 31 },
  mouth: { y: 39, moods: { neutral: 'smile', happy: 'laugh' } },
  hair: ANNOUNCER_HAIR,
  faceProps: [headset()],
  chestProps: [tie({ top: 49 })],
});
