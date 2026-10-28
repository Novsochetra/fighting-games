export const FIREFLY_HOLLOW = {
  folder: 'firefly-hollow',
  groundTop: 8,
  cliff: true,
  // the painted boughs overhead, which sway over a raider about to drop out of them, the vines
  // hanging from them with them, easing still toward the trunks' flared feet; the trunks stand still
  canopy: {
    layer: 'near',
    foot: 110,
    fade: 54,
    trunks: [
      [36, 63],
      [166, 194],
      [316, 343],
      [420, 447],
      [700, 727],
    ],
  },
  layers: [
    { name: 'back', parallax: 0.08 },
    { name: 'near', parallax: 0.45 },
    { name: 'way-in', parallax: 0.5, once: true },
  ],
  ambient: [
    { kind: 'mist', plane: 'back', y: 160, height: 24, drift: 0.3 },
    { kind: 'fireflies', plane: 'back', count: 14, drift: 0.45, top: 70, bottom: 178 },
    { kind: 'fireflies', plane: 'front', count: 6, drift: 1.15, top: 110, bottom: 200 },
  ],
};
