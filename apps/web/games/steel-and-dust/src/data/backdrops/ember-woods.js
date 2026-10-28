export const EMBER_WOODS = {
  folder: 'ember-woods',
  groundTop: 5,
  cliff: true,
  // the autumn crowns raiders hide in to drop on the hero (src/sim/hazards/drop-perches.js): each one's
  // spread, its top, where its sway dies away, and the thick of it where a raider hides (x, y)
  perches: {
    layer: 'near',
    tileWidth: 768,
    spots: [
      { kind: 'crown', from: 2, to: 94, top: 28, bottom: 92, x: 47, y: 66 },
      { kind: 'crown', from: 149, to: 230, top: 29, bottom: 95, x: 189, y: 66 },
      { kind: 'crown', from: 287, to: 379, top: 28, bottom: 92, x: 333, y: 66 },
      { kind: 'crown', from: 386, to: 478, top: 28, bottom: 92, x: 431, y: 66 },
      { kind: 'crown', from: 671, to: 764, top: 28, bottom: 92, x: 717, y: 66 },
    ],
  },
  // the deep earth under a raised step lies level with the road's, not run down from its last row
  deep: { from: 37 },
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
