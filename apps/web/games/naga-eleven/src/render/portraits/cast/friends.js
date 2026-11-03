import { GLOVES, KEEPER_SHIRTS, SHIRTS } from '../../../art/portraits/clothes.js';
import { DARA_HAIR, DARA_HAIR_ADULT } from '../hair/dara.js';
import { RITHY_HAIR } from '../hair/rithy.js';
import { gloves } from '../props/gloves.js';
import { stubble } from '../props/stubble.js';
import { nationalKit } from './national-kit.js';
import { BROWS, person } from './person.js';

const CHILD = { head: 'child', lift: 4, build: 'child', neck: 5, ears: 26 };
const TEEN = { head: 'teen', lift: 2, build: 'teen', neck: 5 };
// grown men stand a little taller in the frame, broader across the shoulders
const MAN = { lift: -1, build: 'big', neck: 7 };

const dara = (clothes, face) =>
  person({
    skin: 'khmer',
    hairTone: 'black',
    clothes,
    colours: GLOVES,
    head: 'round',
    eyes: { set: 'round', y: 25, gap: 3 },
    nose: { name: 'button', y: 33 },
    mouth: { y: 36, moods: { neutral: 'beam', happy: 'laugh' } },
    hair: DARA_HAIR,
    frontProps: [gloves()],
    ...face,
  });

// Dara keeps his round face and grin at every age; his kit and build change, and at twenty-four
// his sides are cut short and he has a day's stubble
export const DARA = {
  child: dara(KEEPER_SHIRTS.chreySchool, { ...CHILD, head: 'round', neck: 5 }),
  teen: dara(KEEPER_SHIRTS.kampongCham, { ...TEEN, head: 'round' }),
  young: dara(KEEPER_SHIRTS.cambodia, {}),
  adult: dara(KEEPER_SHIRTS.cambodia, {
    ...MAN,
    eyes: { set: 'steady', y: 26, gap: 3 },
    hair: DARA_HAIR_ADULT,
    skinDetails: [stubble({ shape: 'round', mouthY: 36 })],
  }),
};

const rithy = (clothes, face) =>
  person({
    skin: 'khmerLight',
    hairTone: 'black',
    iris: 'dark',
    clothes,
    eyes: { set: 'sharp', y: 26, gap: 3 },
    brows: { y: 22, gap: 3, width: 8, look: BROWS.thick, moods: { neutral: 'cocky' } },
    mouth: { y: 38, moods: { neutral: 'smirk', smirk: 'sneer' } },
    hair: RITHY_HAIR,
    ...face,
  });

export const RITHY = {
  child: rithy(SHIRTS.royalKids, {
    ...CHILD,
    eyes: { set: 'fierce', y: 26, gap: 3 },
    nose: { name: 'button', y: 33 },
    mouth: { y: 37, moods: { neutral: 'smirk', smirk: 'sneer' } },
  }),
  teen: rithy(SHIRTS.phnomPenhElite, { ...TEEN, collar: 'vee' }),
  young: rithy(SHIRTS.cambodia, nationalKit(6)),
  adult: rithy(SHIRTS.cambodia, {
    ...nationalKit(7),
    ...MAN,
    head: 'adult',
    brows: { y: 22, gap: 3, width: 9, look: BROWS.heavy, moods: { neutral: 'cocky' } },
    nose: { name: 'straight', y: 31 },
    mouth: { y: 39, moods: { neutral: 'smirk', smirk: 'sneer' } },
  }),
};
