// the painted forests: the layers in assets/backdrops/<folder>/, how fast each one scrolls with
// the camera, and what moves in the air around them; an emitter's x is a spot in its near layer
export const PAINTED_BACKDROPS = {
  pineRidge: {
    folder: 'pine-ridge',
    layers: [
      { name: 'back', parallax: 0.08 },
      { name: 'near', parallax: 0.45 },
    ],
    ambient: [
      { kind: 'birds', plane: 'back', period: 1400, y: 46 },
      { kind: 'mist', plane: 'back', y: 152, height: 32, drift: 0.3 },
      { kind: 'motes', plane: 'front', count: 10, drift: 0.9, top: 40, bottom: 180 },
    ],
  },
  oldGrove: {
    folder: 'old-grove',
    layers: [
      { name: 'back', parallax: 0.08 },
      { name: 'near', parallax: 0.45 },
    ],
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
  },
  bambooPass: {
    folder: 'bamboo-pass',
    layers: [
      { name: 'back', parallax: 0.08 },
      { name: 'near', parallax: 0.45 },
    ],
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
  },
  raiderCamp: {
    folder: 'raider-camp',
    layers: [
      { name: 'back', parallax: 0.08 },
      { name: 'near', parallax: 0.45 },
    ],
    ambient: [
      { kind: 'birds', plane: 'back', period: 1700, y: 40 },
      { kind: 'smoke', plane: 'back', emitters: [{ x: 42, y: 156 }], tileWidth: 384, drift: 0.45 },
      { kind: 'embers', plane: 'back', emitters: [{ x: 42, y: 168 }], tileWidth: 384, drift: 0.45 },
    ],
  },
  emberWoods: {
    folder: 'ember-woods',
    layers: [
      { name: 'back', parallax: 0.08 },
      { name: 'near', parallax: 0.45 },
    ],
    ambient: [
      { kind: 'leaves', plane: 'back', count: 12, drift: 0.45, wind: 0.25 },
      { kind: 'leaves', plane: 'front', count: 8, drift: 1.2, wind: 0.3 },
      { kind: 'motes', plane: 'back', count: 8, drift: 0.3, top: 60, bottom: 180 },
    ],
  },
  fireflyHollow: {
    folder: 'firefly-hollow',
    layers: [
      { name: 'back', parallax: 0.08 },
      { name: 'near', parallax: 0.45 },
    ],
    ambient: [
      { kind: 'mist', plane: 'back', y: 140, height: 44, drift: 0.3 },
      { kind: 'fireflies', plane: 'back', count: 14, drift: 0.45, top: 70, bottom: 178 },
      { kind: 'fireflies', plane: 'front', count: 6, drift: 1.15, top: 110, bottom: 200 },
    ],
  },
};

export function isPaintedTheme(themeId) {
  return Object.hasOwn(PAINTED_BACKDROPS, themeId);
}
