// the role and cast skills' sounds, in SPECIAL_LOOKS's shape (looks.js)
export const SKILL_LOOKS = {
  // stone grinding open, a temple gong, a glint as the eyes open
  bayon: {
    shimmer: 156,
    layers: [
      { kind: 'wash', from: 160, to: 90, duration: 1.4, resonance: 1, peak: 0.28 },
      { kind: 'gong', frequency: 49, decay: 3, peak: 0.3 },
      { kind: 'ring', frequency: 987.8, decay: 1.6, peak: 0.08, at: 0.25 },
      { kind: 'boom', from: 90, to: 28, decay: 1.2, peak: 0.55 },
    ],
  },
  // a trumpet, two stamps and the ground shaking
  elephant: {
    shimmer: 139,
    layers: [
      { kind: 'glide', from: 330, to: 620, duration: 0.5, peak: 0.08, wave: 'sawtooth' },
      { kind: 'flurry', count: 2, gap: 0.18, frequency: 70, peak: 0.4, at: 0.2 },
      { kind: 'boom', from: 80, to: 26, decay: 1.2, peak: 0.6, at: 0.2 },
    ],
  },
  apsara: {
    shimmer: 466,
    layers: [
      { kind: 'flurry', notes: [1047, 1319, 1568, 2093], gap: 0.07, peak: 0.12, wave: 'triangle' },
      { kind: 'ring', frequency: 2093, decay: 1.4, peak: 0.07, at: 0.28 },
      { kind: 'boom', from: 120, to: 44, decay: 0.5, peak: 0.35 },
    ],
  },
  // wind in the kite's paper and its string humming
  kite: {
    shimmer: 392,
    layers: [
      { kind: 'wash', from: 2200, to: 900, duration: 1, resonance: 0.6, peak: 0.22 },
      { kind: 'glide', from: 880, to: 1320, duration: 0.6, peak: 0.06, wave: 'triangle' },
      { kind: 'boom', from: 120, to: 42, decay: 0.6, peak: 0.45, at: 0.1 },
    ],
  },
  // hooves, the dust they raise, the horns striking
  kouprey: {
    shimmer: 175,
    layers: [
      { kind: 'flurry', count: 4, gap: 0.09, frequency: 85, peak: 0.38 },
      { kind: 'wash', from: 300, to: 120, duration: 1, resonance: 0.9, peak: 0.26 },
      { kind: 'boom', from: 110, to: 30, decay: 1, peak: 0.62, at: 0.36 },
    ],
  },
  // a growl, the swipe of a paw
  panther: {
    shimmer: 208,
    layers: [
      { kind: 'glide', from: 220, to: 110, duration: 0.35, peak: 0.09, wave: 'sawtooth' },
      { kind: 'wash', from: 4000, to: 1200, duration: 0.3, resonance: 0.6, peak: 0.2 },
      { kind: 'boom', from: 100, to: 36, decay: 0.7, peak: 0.5 },
    ],
  },
  steel: {
    shimmer: 233,
    layers: [
      { kind: 'ring', frequency: 520, decay: 1.4, peak: 0.14, wave: 'square' },
      { kind: 'ring', frequency: 780, decay: 1, peak: 0.1, at: 0.05 },
      { kind: 'flurry', count: 3, gap: 0.06, frequency: 1200, peak: 0.12 },
      { kind: 'boom', from: 100, to: 40, decay: 0.6, peak: 0.55 },
    ],
  },
  // a comic boing, the ball bounced away, stars twinkling
  belly: {
    shimmer: 294,
    layers: [
      { kind: 'glide', from: 180, to: 520, duration: 0.25, peak: 0.12 },
      { kind: 'glide', from: 520, to: 260, duration: 0.2, peak: 0.08, at: 0.25 },
      { kind: 'boom', from: 90, to: 50, decay: 0.4, peak: 0.45 },
      { kind: 'flurry', notes: [784, 988, 1175], gap: 0.08, peak: 0.1, wave: 'square', at: 0.35 },
    ],
  },
};
