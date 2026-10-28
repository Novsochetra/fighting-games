// the canyon past the forest's edge at dawn, a sandstorm blowing against the hero; `edge` is the
// last of Firefly Hollow's trunks, drawn once where the road leaves the forest
export const SANDSTORM_PASS = {
  folder: 'sandstorm-pass',
  groundTop: 2,
  cliff: true,
  // the deep earth under a raised step lies level with the road's, not run down from its last row
  deep: { from: 46 },
  layers: [
    { name: 'back', parallax: 0.08 },
    { name: 'near', parallax: 0.45 },
    { name: 'edge', parallax: 0.45, once: true },
  ],
  ambient: [
    {
      kind: 'vultures',
      plane: 'back',
      count: 3,
      x: 230,
      y: 58,
      radius: 28,
      turn: 0.011,
      drift: 0.1,
    },
    { kind: 'devil', plane: 'back', period: 2100, x: 300, y: 168, height: 58, drift: 0.12 },
    { kind: 'veil', plane: 'back', y: 132, height: 54, wind: 0.7, drift: 0.3, thickness: 0.3 },
    { kind: 'plumes', plane: 'back', count: 6, y: 186, speed: 0.9, drift: 0.7 },
    {
      kind: 'gusts',
      plane: 'back',
      count: 48,
      speed: 2.6,
      length: 18,
      top: 24,
      bottom: 182,
      drift: 0.6,
      alpha: 0.75,
    },
    {
      kind: 'gusts',
      plane: 'front',
      count: 18,
      speed: 6.5,
      length: 36,
      top: 60,
      bottom: 212,
      drift: 1.3,
      alpha: 0.85,
    },
    { kind: 'tumbleweeds', plane: 'front', count: 2, speed: 1.4, y: 204, drift: 1.25 },
    { kind: 'leaves', plane: 'front', count: 6, drift: 1.2, wind: -1.6 },
  ],
};
