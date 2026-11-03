import { SHIRTS } from '../../../art/portraits/clothes.js';
import { SOCHETRA_HAIR, SOCHETRA_HAIR_ADULT, SOCHETRA_HAIR_YOUNG } from '../hair/sochetra.js';
import { stubble } from '../props/stubble.js';
import { nationalKit } from './national-kit.js';
import { BROWS, person } from './person.js';

const look = (clothes, face) =>
  person({
    skin: 'khmer',
    hairTone: 'black',
    iris: 'amber',
    clothes,
    eyes: { set: 'fierce', y: 25, gap: 3 },
    hair: SOCHETRA_HAIR,
    ...face,
  });

// the same boy growing up: a child's round face and big eyes low in the frame; a lad in his
// school's orange; at nineteen the national kit and a tidier cut; at twenty-four a man's jaw,
// steadier gaze and a day's stubble, his head standing tallest
export const SOCHETRA = {
  child: look(SHIRTS.chreySchool, {
    head: 'child',
    lift: 4,
    build: 'child',
    neck: 5,
    eyes: { set: 'round', y: 26, gap: 3 },
    brows: { y: 23, gap: 3, width: 7, look: BROWS.thick },
    nose: { name: 'button', y: 33 },
    mouth: { y: 37 },
    ears: 26,
  }),
  teen: look(SHIRTS.kampongCham, { head: 'teen', lift: 2, build: 'teen', neck: 5 }),
  young: look(SHIRTS.cambodia, { ...nationalKit(6), hair: SOCHETRA_HAIR_YOUNG }),
  adult: look(SHIRTS.cambodia, {
    ...nationalKit(7),
    head: 'long',
    lift: -1,
    build: 'big',
    eyes: { set: 'steely', y: 26, gap: 3 },
    brows: { y: 22, gap: 3, width: 9, look: BROWS.heavy },
    nose: { name: 'straight', y: 32 },
    mouth: { y: 40 },
    hair: SOCHETRA_HAIR_ADULT,
    skinDetails: [stubble({ shape: 'long', mouthY: 40 })],
  }),
};
