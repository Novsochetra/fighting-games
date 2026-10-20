// the moon and the sun temple on the horizon are one painting that barely moves, so they never
// show twice across the screen as anything on the repeating far plate can. The way out of the
// iron works (scaffolds, a rail line running into the sand) is painted once at the start of the
// road. The near strip is 1152 wide so its cobra statue stands in the Serpent Shrine's screen and
// a column and brazier in the Sun Throne's; brazier fires, sparks and trickles sit on its braziers and
// ledges
const NEAR = { tileWidth: 1152, drift: 0.45 };
const BRAZIERS = [
  { x: 248, y: 148 },
  { x: 377, y: 149 },
  { x: 585, y: 148 },
];

export const MIRAGE_TEMPLE = {
  folder: 'mirage-temple',
  groundTop: 17,
  cliff: true,
  layers: [
    { name: 'back', parallax: 0.08 },
    { name: 'horizon', parallax: 0.01, once: true },
    { name: 'near', parallax: 0.45 },
    { name: 'works', parallax: 0.5, once: true },
  ],
  ambient: [
    { kind: 'mirage', plane: 'back', y: 112, height: 14, drift: 0.08 },
    { kind: 'bats', plane: 'back', period: 1300, y: 40 },
    { kind: 'braziers', plane: 'back', emitters: BRAZIERS, ...NEAR },
    { kind: 'embers', plane: 'back', emitters: BRAZIERS, ...NEAR },
    {
      kind: 'trickle',
      plane: 'back',
      emitters: [
        { x: 848, y: 137, fall: 34 },
        { x: 508, y: 58, fall: 107 },
      ],
      ...NEAR,
    },
    { kind: 'motes', plane: 'back', count: 12, drift: 0.35, top: 90, bottom: 180 },
    {
      kind: 'sandDrift',
      plane: 'front',
      count: 16,
      drift: 1.15,
      wind: 0.45,
      top: 188,
      bottom: 212,
    },
  ],
};
