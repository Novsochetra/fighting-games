export const OLD_GROVE = {
  folder: 'old-grove',
  groundTop: 8,
  cliff: true,
  layers: [
    { name: 'back', parallax: 0.08 },
    { name: 'near', parallax: 0.45 },
    { name: 'way-in', parallax: 0.5, once: true },
  ],
  nestTree: { layer: 'near', from: 95, to: 205, base: 180, bough: 159, branch: 0 },
  ambient: [
    {
      kind: 'shafts',
      plane: 'back',
      shafts: [
        { x: 330, width: 20 },
        { x: 384, width: 12 },
      ],
      slope: -0.55,
      drift: 0.1,
    },
    { kind: 'motes', plane: 'back', count: 18, drift: 0.5, top: 30, bottom: 180 },
    { kind: 'leaves', plane: 'front', count: 7, drift: 1.1, wind: 0.2 },
  ],
};
