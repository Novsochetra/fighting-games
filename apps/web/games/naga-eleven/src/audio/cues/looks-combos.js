// the combos' sounds, in SPECIAL_LOOKS's shape (looks.js)
export const COMBO_LOOKS = {
  // water running, light glinting on it, a gong as it lands
  mekong: {
    shimmer: 247,
    layers: [
      { kind: 'wash', from: 900, to: 2400, duration: 2, resonance: 0.9, peak: 0.28 },
      { kind: 'flurry', notes: [659, 880, 988, 1319], gap: 0.09, peak: 0.09, wave: 'triangle' },
      { kind: 'gong', frequency: 65.4, decay: 2.6, peak: 0.24 },
      { kind: 'boom', from: 120, to: 34, decay: 1, peak: 0.55, at: 0.3 },
    ],
  },
  // the tide rising a long way, then the wave breaking
  'tonle-sap': {
    shimmer: 262,
    layers: [
      { kind: 'wash', from: 200, to: 2600, duration: 2.6, resonance: 0.8, peak: 0.34 },
      {
        kind: 'flurry',
        notes: [523, 659, 784, 1047, 1319],
        gap: 0.1,
        peak: 0.08,
        wave: 'triangle',
      },
      { kind: 'gong', frequency: 49, decay: 3.2, peak: 0.28, at: 0.4 },
      { kind: 'boom', from: 140, to: 28, decay: 1.6, peak: 0.7, at: 0.5 },
    ],
  },
  wave: {
    shimmer: 233,
    layers: [
      { kind: 'wash', from: 300, to: 2200, duration: 1.8, resonance: 0.7, peak: 0.3 },
      { kind: 'boom', from: 130, to: 30, decay: 1.2, peak: 0.62, at: 0.3 },
    ],
  },
  // the crack, the thunder on it, sparks
  lightning: {
    shimmer: 415,
    layers: [
      { kind: 'wash', from: 7000, to: 1800, duration: 0.2, resonance: 0.9, peak: 0.32 },
      { kind: 'boom', from: 160, to: 26, decay: 1.6, peak: 0.72, at: 0.04 },
      { kind: 'flurry', count: 6, gap: 0.03, frequency: 2400, peak: 0.06, wave: 'square' },
      { kind: 'glide', from: 1800, to: 300, duration: 0.25, peak: 0.05, wave: 'sawtooth' },
    ],
  },
  // the Naga's gong, Hanuman's leap and his white wind
  'flying-naga': {
    shimmer: 208,
    layers: [
      { kind: 'gong', frequency: 55, decay: 3.2, peak: 0.3 },
      { kind: 'wash', from: 1200, to: 3400, duration: 1.8, resonance: 0.5, peak: 0.26 },
      { kind: 'flurry', count: 4, gap: 0.06, frequency: 190, peak: 0.28 },
      { kind: 'boom', from: 120, to: 32, decay: 1.1, peak: 0.6, at: 0.2 },
    ],
  },
  // wings, Garuda's cry, thunder and the lightning's crack
  'storm-garuda': {
    shimmer: 349,
    layers: [
      { kind: 'wash', from: 1000, to: 3800, duration: 1.8, resonance: 0.5, peak: 0.3 },
      { kind: 'glide', from: 2300, to: 1400, duration: 0.5, peak: 0.08, at: 0.05 },
      { kind: 'boom', from: 150, to: 26, decay: 1.6, peak: 0.7 },
      { kind: 'wash', from: 7000, to: 2000, duration: 0.2, resonance: 0.8, peak: 0.24, at: 0.4 },
    ],
  },
  // a high ring sinking as the light goes, a low gong in the dark
  eclipse: {
    shimmer: 220,
    layers: [
      { kind: 'ring', frequency: 1318.5, decay: 2.6, peak: 0.1 },
      { kind: 'glide', from: 659, to: 330, duration: 1.6, peak: 0.07 },
      { kind: 'gong', frequency: 41.2, decay: 3.4, peak: 0.26, at: 0.2 },
      { kind: 'boom', from: 100, to: 30, decay: 1, peak: 0.5, at: 0.2 },
    ],
  },
};
