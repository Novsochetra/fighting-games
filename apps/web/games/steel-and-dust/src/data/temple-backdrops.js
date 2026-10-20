// the temples of missions 11 and 12, painted roads like the forests: Angkor Wat at dawn after the
// blood moon, the Bayon at dusk
// the Bayon's two stone fire bowls in its near layer: the flame sits on the coals, sparks lift
// off just above and the smoke rises from the top of the flame
const FIRE_BOWLS = {
  flames: [
    { x: 24, y: 140 },
    { x: 254, y: 161 },
  ],
  embers: [
    { x: 24, y: 136 },
    { x: 254, y: 157 },
  ],
  smoke: [
    { x: 24, y: 128 },
    { x: 254, y: 150 },
  ],
};

export const TEMPLE_BACKDROPS = {
  angkorWat: {
    folder: 'angkor-wat',
    groundTop: 8,
    layers: [
      { name: 'back', parallax: 0.08 },
      { name: 'near', parallax: 0.45 },
    ],
    ambient: [
      {
        kind: 'shafts',
        plane: 'back',
        shafts: [
          { x: 180, width: 18 },
          { x: 214, width: 10 },
        ],
        slope: 0.3,
        drift: 0.1,
      },
      { kind: 'birds', plane: 'back', period: 1500, y: 40 },
      { kind: 'mist', plane: 'back', y: 150, height: 30, drift: 0.3 },
      { kind: 'leaves', plane: 'front', count: 6, drift: 1.1, wind: 0.15 },
    ],
  },
  bayon: {
    folder: 'bayon',
    groundTop: 19,
    layers: [
      { name: 'back', parallax: 0.08 },
      { name: 'near', parallax: 0.45 },
    ],
    fronts: [{ name: 'canopy', parallax: 1.2 }],
    ambient: [
      { kind: 'bats', plane: 'back', period: 1100, y: 66 },
      { kind: 'mist', plane: 'back', y: 160, height: 24, drift: 0.3 },
      { kind: 'motes', plane: 'back', count: 10, drift: 0.5, top: 70, bottom: 180 },
      { kind: 'smoke', plane: 'back', emitters: FIRE_BOWLS.smoke, tileWidth: 384, drift: 0.45 },
      { kind: 'flames', plane: 'back', emitters: FIRE_BOWLS.flames, tileWidth: 384, drift: 0.45 },
      { kind: 'embers', plane: 'back', emitters: FIRE_BOWLS.embers, tileWidth: 384, drift: 0.45 },
      { kind: 'fireflies', plane: 'front', count: 6, drift: 1.15, top: 110, bottom: 200 },
      { kind: 'leaves', plane: 'front', count: 4, drift: 1.2, wind: 0.25 },
    ],
  },
};
