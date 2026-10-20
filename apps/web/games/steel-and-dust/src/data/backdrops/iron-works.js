// the raiders' foundry past the barricade: the canyon's red rock gives way to soot and iron on
// the first screen (`mouth`), then the works run on in the near layer. Emitters sit on the
// furnace mouth and chimney, the pipe and tank vents, the conveyor head and the slag heap
const NEAR = { tileWidth: 960, drift: 0.45 };

export const IRON_WORKS = {
  folder: 'iron-works',
  groundTop: 14,
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
      emitters: [{ x: 590, y: 60 }],
      ...NEAR,
      rise: 0.22,
      wind: 0.1,
      size: 26,
    },
    { kind: 'glow', plane: 'back', emitters: [{ x: 615, y: 166 }], ...NEAR, width: 76, height: 56 },
    {
      kind: 'shimmer',
      plane: 'back',
      emitters: [
        { x: 615, y: 146 },
        { x: 788, y: 176 },
      ],
      ...NEAR,
      width: 40,
      height: 28,
    },
    { kind: 'embers', plane: 'back', emitters: [{ x: 790, y: 182 }], ...NEAR },
    {
      kind: 'sparks',
      plane: 'back',
      emitters: [
        { x: 616, y: 160 },
        { x: 918, y: 80 },
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
