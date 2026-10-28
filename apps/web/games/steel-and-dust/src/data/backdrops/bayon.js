const NEAR = { tileWidth: 384, drift: 0.45 };
// the two stone fire bowls in the near strip, one each side of the face tower: the flame stands on
// the coals, sparks lift off just above and the smoke rises from the top of the flame
const FIRE_BOWLS = [
  { x: 24, y: 140, size: 9 },
  { x: 254, y: 161, size: 7 },
];

const fire = ({ x, y, size }) => ({
  kind: 'flames',
  plane: 'back',
  size,
  emitters: [{ x, y }],
  ...NEAR,
});
const sparks = FIRE_BOWLS.map(({ x, y }) => ({ x, y: y - 4 }));
const smoke = FIRE_BOWLS.map(({ x, y, size }) => ({ x, y: y - size - 2 }));

// the finale at dusk: the road comes on from Angkor Wat, whose naga balustrade, sugar palm and
// frangipani stand at the start; bats cross the bright band of the sky, the fire bowls burn through
// the ground mist, and fig roots hang over the fight from a canopy layer in front of it
export const BAYON = {
  folder: 'bayon',
  groundTop: 19,
  cliff: true,
  // the ruined gate's lintel, short of where it is broken, which raiders climb onto to drop on
  // the hero (src/sim/hazards/drop-perches.js); the face tower's crown is under the HUD
  perches: {
    layer: 'near',
    tileWidth: 384,
    spots: [{ kind: 'ledge', from: 92, to: 146, y: 101 }],
  },
  layers: [
    { name: 'back', parallax: 0.08 },
    { name: 'near', parallax: 0.45 },
    { name: 'way-in', parallax: 0.45, once: true },
  ],
  fronts: [{ name: 'canopy', parallax: 1.2 }],
  ambient: [
    { kind: 'bats', plane: 'back', period: 1100, y: 66 },
    { kind: 'mist', plane: 'back', y: 160, height: 24, drift: 0.3 },
    { kind: 'motes', plane: 'back', count: 10, drift: 0.5, top: 70, bottom: 180 },
    { kind: 'smoke', plane: 'back', emitters: smoke, ...NEAR },
    ...FIRE_BOWLS.map(fire),
    { kind: 'embers', plane: 'back', emitters: sparks, ...NEAR },
    { kind: 'fireflies', plane: 'front', count: 6, drift: 1.15, top: 110, bottom: 200 },
    { kind: 'leaves', plane: 'front', count: 4, drift: 1.2, wind: 0.25 },
  ],
};
