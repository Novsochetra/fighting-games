export const EMBER_WOODS = {
  folder: 'ember-woods',
  groundTop: 5,
  cliff: true,
  layers: [
    { name: 'back', parallax: 0.08 },
    { name: 'near', parallax: 0.45 },
    { name: 'way-in', parallax: 0.5, once: true },
  ],
  nestTree: { layer: 'near', from: 287, to: 381, base: 180, bough: 351, branch: 2 },
  ambient: [
    { kind: 'leaves', plane: 'back', count: 12, drift: 0.45, wind: 0.25 },
    { kind: 'leaves', plane: 'front', count: 8, drift: 1.2, wind: 0.3 },
    { kind: 'motes', plane: 'back', count: 8, drift: 0.3, top: 60, bottom: 180 },
  ],
};
