// the stars' moves' sounds, in SPECIAL_LOOKS's shape (looks.js)
export const STAR_LOOKS = {
  naga: {
    shimmer: 196,
    layers: [
      { kind: 'gong', frequency: 55, decay: 3.2, peak: 0.34 },
      { kind: 'wash', from: 420, to: 1900, duration: 2.2, resonance: 0.8, peak: 0.3 },
      { kind: 'boom', from: 120, to: 32, decay: 1.1, peak: 0.6 },
    ],
  },
  'twin-naga': {
    shimmer: 220,
    layers: [
      { kind: 'gong', frequency: 55, decay: 3.4, peak: 0.3 },
      { kind: 'gong', frequency: 82.4, decay: 3, peak: 0.24, at: 0.12 },
      { kind: 'wash', from: 380, to: 2200, duration: 2.6, resonance: 0.8, peak: 0.32 },
      { kind: 'boom', from: 130, to: 30, decay: 1.3, peak: 0.65 },
    ],
  },
  'seven-naga': {
    shimmer: 247,
    layers: [
      { kind: 'flurry', count: 7, gap: 0.08, frequency: 82, peak: 0.4 },
      { kind: 'gong', frequency: 41.2, decay: 4, peak: 0.36, at: 0.56 },
      { kind: 'wash', from: 300, to: 2600, duration: 3, resonance: 0.7, peak: 0.34, at: 0.3 },
      { kind: 'boom', from: 140, to: 26, decay: 1.8, peak: 0.75, at: 0.56 },
    ],
  },
  garuda: {
    shimmer: 330,
    layers: [
      { kind: 'wash', from: 1200, to: 3600, duration: 1.6, resonance: 0.5, peak: 0.3 },
      { kind: 'glide', from: 2300, to: 1400, duration: 0.5, peak: 0.08, at: 0.05 },
      { kind: 'boom', from: 120, to: 36, decay: 0.9, peak: 0.55 },
    ],
  },
  hanuman: {
    shimmer: 294,
    layers: [
      { kind: 'flurry', count: 6, gap: 0.055, frequency: 190, peak: 0.36 },
      { kind: 'boom', from: 130, to: 40, decay: 0.7, peak: 0.5, at: 0.33 },
    ],
  },
  sword: {
    shimmer: 392,
    layers: [
      { kind: 'wash', from: 6500, to: 1500, duration: 0.25, resonance: 0.7, peak: 0.3 },
      { kind: 'ring', frequency: 1760, decay: 1.6, peak: 0.12, at: 0.03 },
      { kind: 'boom', from: 120, to: 40, decay: 0.6, peak: 0.45 },
    ],
  },
  wall: {
    shimmer: 165,
    layers: [
      { kind: 'boom', from: 90, to: 30, decay: 0.9, peak: 0.6 },
      { kind: 'flurry', count: 3, gap: 0.1, frequency: 95, peak: 0.3, at: 0.08 },
      { kind: 'wash', from: 220, to: 120, duration: 1.2, resonance: 0.9, peak: 0.25 },
    ],
  },
  moon: {
    shimmer: 440,
    layers: [
      { kind: 'ring', frequency: 1318.5, decay: 2.2, peak: 0.1 },
      { kind: 'glide', from: 988, to: 659, duration: 1.2, peak: 0.07 },
      { kind: 'boom', from: 100, to: 36, decay: 0.8, peak: 0.4 },
    ],
  },
  mirror: {
    shimmer: 523,
    layers: [
      { kind: 'flurry', notes: [1568, 2093, 2637, 2093], gap: 0.05, peak: 0.14, wave: 'triangle' },
      { kind: 'ring', frequency: 2093, decay: 0.9, peak: 0.08, at: 0.2 },
      { kind: 'boom', from: 110, to: 44, decay: 0.5, peak: 0.35 },
    ],
  },
  charge: {
    shimmer: 262,
    layers: [
      { kind: 'flurry', count: 8, gap: 0.065, frequency: 110, peak: 0.34 },
      { kind: 'boom', from: 120, to: 36, decay: 0.8, peak: 0.55, at: 0.5 },
    ],
  },
  mountain: {
    shimmer: 147,
    layers: [
      { kind: 'boom', from: 80, to: 25, decay: 1.6, peak: 0.65 },
      { kind: 'wash', from: 170, to: 90, duration: 1.5, resonance: 1, peak: 0.3 },
      { kind: 'gong', frequency: 44, decay: 2, peak: 0.25 },
    ],
  },
  samba: {
    shimmer: 349,
    layers: [
      {
        kind: 'flurry',
        notes: [784, 1175, 784, 1175, 1568],
        gap: 0.08,
        peak: 0.12,
        wave: 'square',
      },
      { kind: 'boom', from: 120, to: 40, decay: 0.6, peak: 0.45, at: 0.4 },
    ],
  },
  rocket: {
    shimmer: 370,
    layers: [
      { kind: 'glide', from: 300, to: 2400, duration: 0.6, peak: 0.07, wave: 'sawtooth' },
      { kind: 'boom', from: 150, to: 28, decay: 1.4, peak: 0.7, at: 0.55 },
      { kind: 'wash', from: 3000, to: 700, duration: 1.2, resonance: 0.6, peak: 0.25, at: 0.55 },
    ],
  },
  iron: {
    shimmer: 175,
    layers: [
      { kind: 'ring', frequency: 380, decay: 1.2, peak: 0.16, wave: 'square' },
      { kind: 'flurry', count: 2, gap: 0.09, frequency: 760, peak: 0.2 },
      { kind: 'boom', from: 100, to: 40, decay: 0.7, peak: 0.5 },
    ],
  },
  plain: {
    shimmer: 262,
    layers: [
      { kind: 'boom', from: 130, to: 38, decay: 0.8, peak: 0.55 },
      { kind: 'wash', from: 1500, to: 600, duration: 0.4, resonance: 0.8, peak: 0.2 },
    ],
  },
};
