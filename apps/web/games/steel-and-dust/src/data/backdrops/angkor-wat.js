// the plate is wide and slow, so the five towers and the sun rising behind them show once and stay
// in view the whole road; the light shafts fall from that sun and drift with it, and the glints sit
// on the moat. The road comes out of the Warden's Fortress, whose last tower, barricade and pennant
// pole stand overgrown at the start. The incense smoke rises from the shrine in the near strip
export const ANGKOR_WAT = {
  folder: 'angkor-wat',
  groundTop: 19,
  cliff: true,
  layers: [
    { name: 'back', parallax: 0.05 },
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
      drift: 0.05,
    },
    { kind: 'birds', plane: 'back', period: 1500, y: 44 },
    { kind: 'mist', plane: 'back', y: 150, height: 16, drift: 0.1 },
    { kind: 'glints', plane: 'back', count: 14, top: 155, bottom: 170, drift: 0.05 },
    { kind: 'motes', plane: 'back', count: 10, drift: 0.3, top: 40, bottom: 150 },
    { kind: 'smoke', plane: 'back', emitters: [{ x: 321, y: 170 }], tileWidth: 768, drift: 0.45 },
    { kind: 'butterflies', plane: 'back', count: 4, top: 120, bottom: 176, drift: 0.45 },
    { kind: 'leaves', plane: 'front', count: 6, drift: 1.1, wind: 0.15 },
  ],
};
