export const PINE_RIDGE = {
  folder: 'pine-ridge',
  groundTop: 7,
  cliff: true,
  // the pines raiders climb into to drop on the hero (src/sim/hazards/drop-perches.js): each one's
  // spread, its tip, where its sway dies away, and the thick of it where a raider hides (x, y)
  perches: {
    layer: 'near',
    tileWidth: 768,
    spots: [
      { kind: 'crown', from: 20, to: 73, top: 31, bottom: 141, x: 46, y: 88 },
      { kind: 'crown', from: 107, to: 171, top: 16, bottom: 126, x: 139, y: 77 },
      { kind: 'crown', from: 201, to: 270, top: 8, bottom: 118, x: 237, y: 69 },
      { kind: 'crown', from: 294, to: 369, top: 0, bottom: 110, x: 331, y: 56 },
      { kind: 'crown', from: 423, to: 491, top: 4, bottom: 114, x: 457, y: 67 },
      { kind: 'crown', from: 578, to: 626, top: 42, bottom: 152, x: 602, y: 105 },
    ],
  },
  layers: [
    { name: 'back', parallax: 0.08 },
    { name: 'near', parallax: 0.45 },
  ],
  nestTree: { layer: 'near', from: 13, to: 83, base: 180, bough: 49 },
  ambient: [
    { kind: 'birds', plane: 'back', period: 1400, y: 46 },
    { kind: 'mist', plane: 'back', y: 152, height: 32, drift: 0.3 },
    { kind: 'motes', plane: 'front', count: 10, drift: 0.9, top: 40, bottom: 180 },
  ],
};
