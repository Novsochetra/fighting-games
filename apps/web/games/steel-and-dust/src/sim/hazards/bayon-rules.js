import { PILLAR_BURNS } from './gaze-pillars.js';
import { ROOT_STRIKES } from './fig-roots.js';
import { beamArea, isBreathing } from './stone-faces.js';

const PILLAR_HIT = { knockback: [0.8, -1.6], hitstop: 7, hitstun: 20, stone: 110 };
const ROOT_HIT = { knockback: [1.4, -4.4], knockdown: true, hitstop: 7, hitstun: 22 };
const BEAM_HIT = { knockback: [3.2, -3.4], knockdown: true, hitstop: 8, hitstun: 24 };

const burning =
  ([from, to]) =>
  (shot) =>
    shot.time >= from && shot.time < to;

// the Bayon Guardian's gold pillars, fig roots and stone faces, read with the rest in
// shot-rules.js; each strikes only while its strip draws it at full height
export const BAYON_RULES = {
  // the pillar's core burns those standing in it and turns them slow as stone
  gazePillar: {
    range: 34,
    area: (pillar) => ({ x: pillar.x - 10, y: pillar.y - 92, width: 20, height: 92 }),
    hit: PILLAR_HIT,
    enemyWeapon: 'none',
    armed: burning(PILLAR_BURNS),
  },
  figRoot: {
    range: 34,
    area: (root) => ({ x: root.x - 9, y: root.y - 38, width: 18, height: 38 }),
    hit: ROOT_HIT,
    enemyWeapon: 'hammer',
    armed: burning(ROOT_STRIKES),
  },
  stoneFace: {
    range: 120,
    area: beamArea,
    hit: BEAM_HIT,
    enemyWeapon: 'none',
    armed: isBreathing,
  },
};
