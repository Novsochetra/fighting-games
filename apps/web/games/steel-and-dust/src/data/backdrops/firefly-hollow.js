export const FIREFLY_HOLLOW = {
  folder: 'firefly-hollow',
  groundTop: 8,
  layers: [
    { name: 'back', parallax: 0.08 },
    { name: 'near', parallax: 0.45 },
  ],
  ambient: [
    { kind: 'mist', plane: 'back', y: 160, height: 24, drift: 0.3 },
    { kind: 'fireflies', plane: 'back', count: 14, drift: 0.45, top: 70, bottom: 178 },
    { kind: 'fireflies', plane: 'front', count: 6, drift: 1.15, top: 110, bottom: 200 },
  ],
};
