import { BOSS_BODIES } from '../boss-bodies.js';

// the bosses of the temple roads: the Naga Raja guards Angkor Wat at dawn, and the Bayon Guardian,
// the strongest of them all, wakes at dusk to end the game
const GUARD = { frontArm: 1.35, frontForearm: -0.95, weaponAngle: -2.4 };

export const TEMPLE_BOSSES = {
  naga: {
    name: 'Naga Raja',
    sprite: 'naga',
    ...BOSS_BODIES.naga,
    material: 'shell',
    hp: 310,
    speed: 0.75,
    range: 60,
    palette: 'brute',
    weapon: 'knife',
    voicePitch: 1.1,
    // her sheet is drawn half as fine again (`density`), so at this scale she stands sharp, about two
    // and a quarter times the hero's height
    scale: 1.5,
    armor: true,
    boss: true,
    guardPose: GUARD,
  },
  guardian: {
    name: 'Bayon Guardian',
    sprite: 'guardian',
    ...BOSS_BODIES.guardian,
    material: 'sandstone',
    hp: 360,
    speed: 0.55,
    range: 38,
    palette: 'brute',
    weapon: 'hammer',
    voicePitch: 0.5,
    scale: 2.15,
    armor: true,
    boss: true,
    guardPose: GUARD,
  },
};
