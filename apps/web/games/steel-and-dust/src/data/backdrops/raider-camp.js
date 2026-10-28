export const RAIDER_CAMP = {
  folder: 'raider-camp',
  groundTop: 13,
  cliff: true,
  // the lookout tower's floor between its stakes, which raiders climb onto to drop on the hero
  // (src/sim/hazards/drop-perches.js); the stakes' tips stand clear of the HUD
  perches: {
    layer: 'near',
    tileWidth: 384,
    spots: [{ kind: 'ledge', from: 109, to: 144, y: 92 }],
  },
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
