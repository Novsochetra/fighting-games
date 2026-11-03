import { mixOf, pickerOf } from '../cast/seeded.js';

// shapes only: a star's colours are the ones his portrait already has
const STAR_LOOKS = {
  sochetra: { face: 'hero', hair: 'spiky' },
  dara: { face: 'friend', hair: 'buzz' },
  rithy: { face: 'ace', hair: 'swept' },
  haruto: { face: 'ace', hair: 'side-part' },
  minjun: { face: 'hero', hair: 'crop' },
  farhad: { face: 'wall', hair: 'buzz' },
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

// a keeper keeps his head bare: his glove cuffs are painted in the colours a band would take
function plainLook({ team = 'side-0', kit = 'plain-0', wear = 'home', place = 0 }, age) {
  const pool = HAIR_POOLS[kit] ?? HAIR_POOLS.default;
  const hairs = age === 'child' ? pool.filter((hair) => !GROWN_ONLY.has(hair)) : pool;
  const { face, hair } = mixOf({ face: PLAIN_FACES, hair: hairs }, { seed: team, place });
  const keeper = wear.startsWith('keeper');
  const gear = keeper ? null : pickerOf(`${team}:${place}`)(BANDS, 'kit-band');

  return { face, hair, gear, tone: 'kit' };
}

export function kitLookOf({ character, age, variant }) {
  const look = character === 'footballer' ? plainLook(variant ?? {}, age) : STAR_LOOKS[character];

  if (!look) {
    return null;
  }

  return age === 'child' ? { ...look, face: 'child' } : look;
}
