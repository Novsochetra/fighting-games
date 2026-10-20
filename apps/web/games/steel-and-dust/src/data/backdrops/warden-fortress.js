const NEAR_WIDTH = 1280;
const NEAR_DRIFT = 0.45;
// where the brazier, the fire bowl and the torch burn in the near layer
const FIRES = [
  { x: 319, y: 147, size: 9 },
  { x: 916, y: 141, size: 12 },
  { x: 1073, y: 120, size: 7 },
];

const inNearLayer = (emitters) => ({ emitters, tileWidth: NEAR_WIDTH, drift: NEAR_DRIFT });
const fire = ({ x, y, size }) => ({
  kind: 'flames',
  plane: 'back',
  size,
  ...inNearLayer([{ x, y }]),
});
const sparks = FIRES.map(({ x, y, size }) => ({ x, y: y - size }));

// the ruins are the last of the sun temple, met once at the start of the road
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
    ...FIRES.map(fire),
    { kind: 'embers', plane: 'back', ...inNearLayer(sparks) },
    {
      kind: 'pennants',
      plane: 'back',
      length: 64,
      height: 14,
      flutter: 3,
      droop: 4,
      ...inNearLayer([{ x: 659, y: 52 }]),
    },
    { kind: 'mist', plane: 'back', y: 148, height: 36, drift: 0.3 },
    { kind: 'motes', plane: 'back', count: 12, drift: 0.5, top: 70, bottom: 184 },
    { kind: 'leaves', plane: 'front', count: 10, drift: 1.2, wind: -0.18 },
  ],
};
