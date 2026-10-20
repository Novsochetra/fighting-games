export const RAIDER_CAMP = {
  folder: 'raider-camp',
  groundTop: 13,
  cliff: true,
  layers: [
    { name: 'back', parallax: 0.08 },
    { name: 'near', parallax: 0.45 },
    { name: 'way-in', parallax: 0.5, once: true },
  ],
  ambient: [
    { kind: 'birds', plane: 'back', period: 1700, y: 40 },
    { kind: 'mist', plane: 'back', y: 150, height: 34, drift: 0.3 },
    { kind: 'smoke', plane: 'back', emitters: [{ x: 42, y: 162 }], tileWidth: 384, drift: 0.45 },
    { kind: 'embers', plane: 'back', emitters: [{ x: 42, y: 174 }], tileWidth: 384, drift: 0.45 },
    { kind: 'motes', plane: 'front', count: 8, drift: 1.05, top: 70, bottom: 188 },
  ],
};
