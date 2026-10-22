// the bosses of the temple roads: the Naga Raja guards Angkor Wat at dawn, and the Bayon Guardian,
// the strongest of them all, wakes at dusk to end the game
const GUARD = { frontArm: 1.35, frontForearm: -0.95, weaponAngle: -2.4 };

export const TEMPLE_BOSSES = {
  naga: {
    name: 'Naga Raja',
    sprite: 'naga',
    material: 'shell',
    hp: 310,
    speed: 0.75,
    range: 40,
    palette: 'brute',
    weapon: 'knife',
    voicePitch: 1.1,
    scale: 1.9,
    armor: true,
    boss: true,
    guardPose: GUARD,
  },
  guardian: {
    name: 'Bayon Guardian',
    sprite: 'guardian',
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
