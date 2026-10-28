// the plate is wide and slow, so the five towers and the sun rising behind them show once and stay
// in view the whole road, between the two HUD panels from the first screen to the last; the light
// shafts fall from that sun and drift with it, and the glints sit on the moat. The road comes out of the Warden's Fortress, whose last tower, barricade and pennant
// pole stand overgrown at the start. The incense smoke rises from the shrine in the near strip
export const ANGKOR_WAT = {
  folder: 'angkor-wat',
  groundTop: 10,
  cliff: true,
  // only the paving and its turf follow the steps; from the mortar under the paving down, the road
  // is built level: laterite courses up to the highest step and earth under the road's own course,
  // their ends staggered and broken where a step or the breach cuts through them
  deep: { from: 20, faces: true },
  layers: [
    { name: 'back', parallax: 0.03 },
    { name: 'near', parallax: 0.45 },
    { name: 'way-in', parallax: 0.45, once: true },
  ],
  ambient: [
    {
      kind: 'shafts',
      plane: 'back',
      shafts: [
        { x: 330, width: 12 },
        { x: 352, width: 8 },
      ],
      slope: -0.3,
      drift: 0.03,
    },
    { kind: 'birds', plane: 'back', period: 1500, y: 44 },
    { kind: 'glints', plane: 'back', count: 14, top: 165, bottom: 180, drift: 0.03 },
    { kind: 'motes', plane: 'back', count: 10, drift: 0.3, top: 40, bottom: 150 },
    { kind: 'smoke', plane: 'back', emitters: [{ x: 270, y: 162 }], tileWidth: 768, drift: 0.45 },
    { kind: 'butterflies', plane: 'back', count: 4, top: 120, bottom: 176, drift: 0.45 },
    { kind: 'leaves', plane: 'front', count: 6, drift: 1.1, wind: 0.15 },
  ],
};
