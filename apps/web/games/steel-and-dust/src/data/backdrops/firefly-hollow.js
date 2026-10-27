export const FIREFLY_HOLLOW = {
  folder: 'firefly-hollow',
  groundTop: 8,
  cliff: true,
  layers: [
    { name: 'back', parallax: 0.08 },
    { name: 'near', parallax: 0.45 },
    { name: 'way-in', parallax: 0.5, once: true },
  ],
  nestTree: { layer: 'near', from: 275, to: 368, base: 177, bough: 337, branch: 4 },
  ambient: [
    { kind: 'mist', plane: 'back', y: 160, height: 24, drift: 0.3 },
    { kind: 'fireflies', plane: 'back', count: 14, drift: 0.45, top: 70, bottom: 178 },
    { kind: 'fireflies', plane: 'front', count: 6, drift: 1.15, top: 110, bottom: 200 },
  ],
};
