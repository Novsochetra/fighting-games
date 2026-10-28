export const BAMBOO_PASS = {
  folder: 'bamboo-pass',
  groundTop: 1,
  cliff: true,
  // the painted stalks, which bend over a raider about to drop out of their tops: rooted far below,
  // they lean more the higher up they are, and dip less than a bough would; each of `stalks` (spans
  // of the layer's own columns, stalks standing together as one) leans as one
  canopy: {
    layer: 'near',
    foot: 120,
    fade: 120,
    give: { sway: 1.2, sag: 0.5 },
    stalks: [
      [43, 65],
      [70, 124],
      [154, 238],
      [303, 361],
      [427, 449],
      [454, 508],
      [687, 745],
    ],
  },
  layers: [
    { name: 'back', parallax: 0.08 },
    { name: 'near', parallax: 0.45 },
    { name: 'way-in', parallax: 0.5, once: true },
  ],
  nestTree: { layer: 'near', from: 291, to: 367, base: 189, bough: 350, branch: 1 },
  ambient: [
    {
      kind: 'shafts',
      plane: 'back',
      shafts: [
        { x: 250, width: 16 },
        { x: 320, width: 24 },
      ],
      slope: -0.35,
      drift: 0.1,
    },
    { kind: 'motes', plane: 'back', count: 14, drift: 0.5, top: 20, bottom: 180 },
    { kind: 'leaves', plane: 'front', count: 9, drift: 1.1, wind: 0.35 },
  ],
};
