// the raiders' foundry past the barricade: the canyon's red rock gives way to soot and iron on
// the first screen (`mouth`), then the works run on in the near layer. Emitters sit on the brick
// furnace's mouth and chimney, the blast furnace's tap hole, the pipe and tank vents, the
// conveyor head and the slag heap; the strip is laid out so the blast furnace stands behind the
// Great Furnace's arena and the slag heap behind the Slag Gate's
const NEAR = { tileWidth: 1872, drift: 0.45 };

export const IRON_WORKS = {
  folder: 'iron-works',
  groundTop: 14,
  cliff: true,
  // a girder halfway up the derrick and the furnace roof either side of its chimney, which raiders
  // climb onto to drop on the hero (src/sim/hazards/drop-perches.js); the derrick's top and the water
  // tower's are under the HUD
  perches: {
    layer: 'near',
    tileWidth: NEAR.tileWidth,
    leap: 'clank',
    spots: [
      { kind: 'ledge', from: 395, to: 452, y: 95 },
      { kind: 'ledge', from: 700, to: 720, y: 97 },
      { kind: 'ledge', from: 749, to: 775, y: 97 },
    ],
  },
  layers: [
    { name: 'back', parallax: 0.08 },
    { name: 'mouth', parallax: 0.3, once: true },
    { name: 'near', parallax: 0.45 },
  ],
  ambient: [
    { kind: 'ash', plane: 'back', count: 18, drift: 0.3, wind: 0.05 },
    {
      kind: 'plume',
      plane: 'back',
      emitters: [{ x: 736, y: 60 }],
      ...NEAR,
      rise: 0.22,
      wind: 0.1,
      size: 26,
    },
    {
      kind: 'glow',
      plane: 'back',
      emitters: [
        { x: 761, y: 166 },
        { x: 986, y: 166 },
      ],
      ...NEAR,
      width: 76,
      height: 56,
    },
    {
      kind: 'shimmer',
      plane: 'back',
      emitters: [
        { x: 761, y: 146 },
        { x: 992, y: 150 },
        { x: 1402, y: 176 },
      ],
      ...NEAR,
      width: 40,
      height: 28,
    },
    { kind: 'embers', plane: 'back', emitters: [{ x: 1404, y: 182 }], ...NEAR },
    {
      kind: 'sparks',
      plane: 'back',
      emitters: [
        { x: 762, y: 160 },
        { x: 1537, y: 80 },
        { x: 994, y: 168 },
      ],
      ...NEAR,
      period: 130,
      burst: 50,
      count: 28,
    },
    {
      kind: 'steam',
      plane: 'back',
      emitters: [
        { x: 123, y: 114 },
        { x: 280, y: 85 },
      ],
      ...NEAR,
      period: 260,
      burst: 44,
      toward: [0.15, -1],
    },
    {
      kind: 'steam',
      plane: 'back',
      emitters: [{ x: 177, y: 157 }],
      ...NEAR,
      period: 200,
      burst: 28,
      toward: [1, -0.15],
    },
    { kind: 'ash', plane: 'front', count: 24, drift: 1.15, wind: 0.12 },
  ],
};
