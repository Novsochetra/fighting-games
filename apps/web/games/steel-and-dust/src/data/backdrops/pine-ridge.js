export const PINE_RIDGE = {
  folder: 'pine-ridge',
  groundTop: 7,
  cliff: true,
  layers: [
    { name: 'back', parallax: 0.08 },
    { name: 'near', parallax: 0.45 },
  ],
  nestTree: { layer: 'near', from: 13, to: 83, base: 180, bough: 50, branch: 0 },
  ambient: [
    { kind: 'birds', plane: 'back', period: 1400, y: 46 },
    { kind: 'mist', plane: 'back', y: 152, height: 32, drift: 0.3 },
    { kind: 'motes', plane: 'front', count: 10, drift: 0.9, top: 40, bottom: 180 },
  ],
};
