const NEAR_WIDTH = 2040;
// with this width and drift the three boss arenas each look onto their own stretch of the strip
const NEAR_DRIFT = 0.455;
// where the brazier, the torch, the wall sconce and the fire bowl burn in the near layer
const FIRES = [
  { x: 323, y: 147, size: 9 },
  { x: 379, y: 120, size: 7 },
  { x: 1091, y: 131, size: 7 },
  { x: 1536, y: 141, size: 12 },
];

const inNearLayer = (emitters) => ({ emitters, tileWidth: NEAR_WIDTH, drift: NEAR_DRIFT });
const fire = ({ x, y, size }) => ({
  kind: 'flames',
  plane: 'back',
  size,
  ...inNearLayer([{ x, y }]),
});
const sparks = FIRES.map(({ x, y, size }) => ({ x, y: y - size }));

// the ruins are the last of the sun temple, met once at the start of the road; the fires burn
// through the ground mist, so they come after it
export const WARDEN_FORTRESS = {
  folder: 'warden-fortress',
  groundTop: 14,
  cliff: true,
  layers: [
    { name: 'back', parallax: 0.08 },
    { name: 'near', parallax: NEAR_DRIFT },
    { name: 'ruins', parallax: NEAR_DRIFT, once: true },
  ],
  ambient: [
    { kind: 'lightning', plane: 'back', period: 540, top: 0, bottom: 150, strength: 0.06 },
    { kind: 'birds', plane: 'back', period: 1500, y: 44 },
    { kind: 'birds', plane: 'back', period: 2300, y: 70 },
    {
      kind: 'pennants',
      plane: 'back',
      length: 64,
      height: 14,
      flutter: 3,
      droop: 4,
      ...inNearLayer([{ x: 629, y: 52 }]),
    },
    { kind: 'mist', plane: 'back', y: 148, height: 36, drift: 0.3 },
    ...FIRES.map(fire),
    { kind: 'embers', plane: 'back', ...inNearLayer(sparks) },
    { kind: 'motes', plane: 'back', count: 18, drift: 0.5, top: 60, bottom: 184 },
    { kind: 'leaves', plane: 'front', count: 14, drift: 1.2, wind: -0.18 },
  ],
};
