export const OLD_GROVE = {
  folder: 'old-grove',
  groundTop: 8,
  cliff: true,
  // the painted trees overhead, which sway over a raider about to drop out of them: the boughs and
  // all that hangs from them, down to `foot`, easing still over the last `fade` rows, in clear air
  // below the vines; the trunks among them (spans of the layer's own columns) stand still
  canopy: {
    layer: 'near',
    foot: 90,
    fade: 12,
    trunks: [
      [18, 56],
      [135, 167],
      [266, 300],
    ],
  },
  // the deep earth under a raised step lies level with the road's, not run down from its last row
  deep: { from: 40 },
  layers: [
    { name: 'back', parallax: 0.08 },
    { name: 'near', parallax: 0.45 },
    { name: 'way-in', parallax: 0.5, once: true },
  ],
  nestTree: { layer: 'near', from: 95, to: 205, base: 180, bough: 159, branch: 0 },
  ambient: [
    {
      kind: 'shafts',
      plane: 'back',
      shafts: [
        { x: 330, width: 20 },
        { x: 384, width: 12 },
      ],
      slope: -0.55,
      drift: 0.1,
    },
    { kind: 'motes', plane: 'back', count: 18, drift: 0.5, top: 30, bottom: 180 },
    { kind: 'leaves', plane: 'front', count: 7, drift: 1.1, wind: 0.2 },
  ],
};
