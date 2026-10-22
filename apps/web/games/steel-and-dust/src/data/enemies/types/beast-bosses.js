import { BOSS_BODIES } from '../boss-bodies.js';

// mission bosses that fight like beasts; like every boss they swipe, slam and charge
const GUARD = { frontArm: 1.35, frontForearm: -0.95, weaponAngle: -2.4 };

export const BEAST_BOSSES = {
  ironhorn: {
    name: 'Ironhorn',
    sprite: 'ironhorn',
    ...BOSS_BODIES.ironhorn,
    material: 'metal',
    hp: 250,
    speed: 0.55,
    range: 36,
    palette: 'brute',
    weapon: 'hammer',
    voicePitch: 0.55,
    scale: 2.25,
    armor: true,
    boss: true,
    guardPose: GUARD,
  },
  cobra: {
    name: 'Cobra Matriarch',
    sprite: 'cobra',
    ...BOSS_BODIES.cobra,
    material: 'shell',
    hp: 250,
    speed: 0.7,
    range: 40,
    palette: 'brute',
    weapon: 'knife',
    voicePitch: 1.15,
    scale: 1.9,
    armor: true,
    boss: true,
    guardPose: GUARD,
  },
  gnoll: {
    name: 'Gnoll Packlord',
    sprite: 'gnoll',
    ...BOSS_BODIES.gnoll,
    hp: 270,
    speed: 0.75,
    range: 36,
    palette: 'brute',
    weapon: 'hammer',
    voicePitch: 0.75,
    scale: 1.9,
    armor: true,
    boss: true,
    guardPose: GUARD,
  },
};
