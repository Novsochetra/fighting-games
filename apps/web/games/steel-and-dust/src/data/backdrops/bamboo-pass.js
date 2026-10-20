export const BAMBOO_PASS = {
  folder: 'bamboo-pass',
  groundTop: 1,
  cliff: true,
  layers: [
    { name: 'back', parallax: 0.08 },
    { name: 'near', parallax: 0.45 },
    { name: 'way-in', parallax: 0.5, once: true },
  ],
  ambient: [
    {
      kind: 'shafts',
      plane: 'back',
      shafts: [
        { x: 250, width: 16 },
        { x: 320, width: 24 },
      ],
      slope: -0.35,
      drift: 0.1,
    },
    { kind: 'motes', plane: 'back', count: 14, drift: 0.5, top: 20, bottom: 180 },
    { kind: 'leaves', plane: 'front', count: 9, drift: 1.1, wind: 0.35 },
  ],
};
