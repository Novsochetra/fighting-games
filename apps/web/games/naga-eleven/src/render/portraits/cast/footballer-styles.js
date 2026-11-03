import { BOWL_HAIR } from '../hair/bowl.js';
import { BUZZ_HAIR } from '../hair/buzz.js';
import { CROP_HAIR } from '../hair/crop.js';
import { CURLS_HAIR } from '../hair/curls.js';
import { CURTAINS_HAIR } from '../hair/curtains.js';
import { FADE_HAIR } from '../hair/fade.js';
import { MOP_HAIR } from '../hair/mop.js';
import { PARTED_HAIR } from '../hair/parted.js';
import { QUIFF_HAIR } from '../hair/quiff.js';

const ALL = ['child', 'teen', 'young', 'adult'];
const GROWN = ['teen', 'young', 'adult'];

const HAIRS = {
  bowl: { hair: BOWL_HAIR, ages: ['child', 'teen'] },
  buzz: { hair: BUZZ_HAIR, ages: ALL },
  crop: { hair: CROP_HAIR, ages: ALL },
  curls: { hair: CURLS_HAIR, ages: ALL },
  curtains: { hair: CURTAINS_HAIR, ages: ALL },
  fade: { hair: FADE_HAIR, ages: GROWN },
  mop: { hair: MOP_HAIR, ages: ['teen', 'young'] },
  parted: { hair: PARTED_HAIR, ages: ['young', 'adult'] },
  quiff: { hair: QUIFF_HAIR, ages: GROWN },
};

const squad = (hairs, irises, whiskers) => ({ hairs, irises, whiskers });

const KHMER = squad(
  ['bowl', 'buzz', 'crop', 'curtains', 'quiff', 'fade', 'mop'],
  ['brown', 'dark'],
  ['none', 'none', 'none', 'stubble'],
);

const EAST_ASIA = squad(
  ['curtains', 'crop', 'mop', 'quiff', 'buzz', 'bowl'],
  ['dark', 'brown'],
  ['none', 'none', 'none', 'none', 'stubble'],
);

export const SQUAD_STYLES = {
  default: KHMER,
  japan: EAST_ASIA,
  korea: EAST_ASIA,
  thailand: squad(
    ['crop', 'buzz', 'quiff', 'curtains', 'fade', 'mop'],
    ['brown', 'dark'],
    ['none', 'none', 'stubble'],
  ),
  iran: squad(
    ['parted', 'quiff', 'crop', 'fade', 'curls', 'buzz'],
    ['brown', 'dark', 'green'],
    ['stubble', 'beard', 'none', 'moustache'],
  ),
  brazil: squad(
    ['curls', 'fade', 'buzz', 'quiff', 'crop', 'parted'],
    ['brown', 'dark', 'brown', 'green'],
    ['none', 'stubble', 'none', 'beard'],
  ),
  nigeria: squad(
    ['curls', 'fade', 'buzz', 'crop'],
    ['dark', 'brown'],
    ['none', 'stubble', 'beard'],
  ),
  mexico: squad(
    ['parted', 'quiff', 'crop', 'fade', 'curls', 'buzz'],
    ['brown', 'dark'],
    ['none', 'stubble', 'moustache', 'beard'],
  ),
  germany: squad(
    ['parted', 'quiff', 'crop', 'fade', 'buzz', 'curtains'],
    ['blue', 'brown', 'green', 'blue'],
    ['none', 'stubble', 'none'],
  ),
};

export function stylesFor(kit, age) {
  const styles = SQUAD_STYLES[kit] ?? SQUAD_STYLES.default;
  const fitting = styles.hairs.filter((name) => HAIRS[name].ages.includes(age));

  return {
    ...styles,
    hairs: (fitting.length > 0 ? fitting : styles.hairs).map((name) => HAIRS[name].hair),
  };
}
