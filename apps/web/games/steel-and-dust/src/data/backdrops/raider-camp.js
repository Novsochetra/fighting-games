export const RAIDER_CAMP = {
  folder: 'raider-camp',
  groundTop: 13,
  layers: [
    { name: 'back', parallax: 0.08 },
    { name: 'near', parallax: 0.45 },
  ],
  ambient: [
    { kind: 'birds', plane: 'back', period: 1700, y: 40 },
    { kind: 'smoke', plane: 'back', emitters: [{ x: 42, y: 156 }], tileWidth: 384, drift: 0.45 },
    { kind: 'embers', plane: 'back', emitters: [{ x: 42, y: 168 }], tileWidth: 384, drift: 0.45 },
  ],
};
