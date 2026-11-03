import { mixOf, pickerOf } from '../cast/seeded.js';

// shapes only: a star's colours are the ones his portrait already has
const STAR_LOOKS = {
  sochetra: { face: 'hero', hair: 'spiky' },
  dara: { face: 'friend', hair: 'buzz' },
  rithy: { face: 'ace', hair: 'swept' },
  haruto: { face: 'ace', hair: 'side-part' },
  minjun: { face: 'hero', hair: 'crop' },
  farhad: { face: 'wall', hair: 'buzz', facial: 'beard' },
  rafael: { face: 'friend', hair: 'curly', gear: 'headband', tone: 'white' },
  lukas: { face: 'wall', hair: 'crop' },
};

const PLAIN_FACES = ['friend', 'ace', 'wall', 'hero'];

// the spiky hair and the curls are Sochetra's and Rafael's own, so no plain player wears them
const EVERYDAY = ['crop', 'side-part', 'curtains', 'swept', 'buzz', 'bowl', 'bedhead', 'slicked'];

const HAIR_POOLS = {
  default: EVERYDAY,
  nigeria: ['afro', 'twists', 'cornrows', 'buzz', 'crop'],
  brazil: ['twists', 'cornrows', 'long-back', 'slicked', 'buzz', 'crop', 'shoulder'],
  mexico: ['slicked', 'crop', 'side-part', 'long-back', 'swept', 'buzz'],
  germany: ['crop', 'side-part', 'swept', 'slicked', 'mohawk', 'top-knot', 'buzz'],
};

const GROWN_ONLY = new Set(['receding', 'slicked', 'long-back', 'shoulder', 'top-knot']);

const BANDS = [null, null, null, null, null, null, null, null, 'headband', 'sweatband'];

// facial hair follows the jaw it was painted on, the adult's, which the wall's face was drawn from
const BEARDED_FACES = new Set(['wall', 'adult']);

// boys are clean-shaven and at nineteen a beard is a day's growth; a keeper with a full beard and
// gloves would be Farhad's double
const WHISKERS = {
  young: [null, null, null, null, 'stubble', 'sideburns'],
  adult: [null, null, null, 'stubble', 'goatee', 'sideburns', 'moustache', 'beard'],
};

function whiskersOf({ face, age, keeper, pick }) {
  if (!BEARDED_FACES.has(face)) {
    return null;
  }

  const pool = (WHISKERS[age] ?? [null]).filter((whisker) => !keeper || whisker !== 'beard');

  return pick(pool, 'kit-whiskers');
}

// a keeper keeps his head bare: his glove cuffs are painted in the colours a band would take
function plainLook({ team = 'side-0', kit = 'plain-0', wear = 'home', place = 0 }, age) {
  const pool = HAIR_POOLS[kit] ?? HAIR_POOLS.default;
  const hairs = age === 'child' ? pool.filter((hair) => !GROWN_ONLY.has(hair)) : pool;
  const { face, hair } = mixOf({ face: PLAIN_FACES, hair: hairs }, { seed: team, place });
  const keeper = wear.startsWith('keeper');
  const pick = pickerOf(`${team}:${place}`);
  const gear = keeper ? null : pick(BANDS, 'kit-band');
  const facial = whiskersOf({ face, age, keeper, pick });

  return { face, hair, facial, gear, tone: 'kit' };
}

export function kitLookOf({ character, age, variant }) {
  const look = character === 'footballer' ? plainLook(variant ?? {}, age) : STAR_LOOKS[character];

  if (!look) {
    return null;
  }

  if (age !== 'child') {
    return look;
  }

  const boy = Object.entries(look).filter(([part]) => part !== 'facial');

  return { ...Object.fromEntries(boy), face: 'child' };
}
