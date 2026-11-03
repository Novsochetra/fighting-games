// The temples at first light. On the training steps the low sun rakes in from the left, gold on
// the sandstone and violet in its shade; at Angkor Wat the sun climbs behind the five towers
// and the moat gives the whole sky back.

export const TEMPLE_DAWN_ART = {
  sky: ['#4e5c9c', '#6c78b0', '#9490bc', '#c0a6b8', '#e4bca4', '#f6d6a0'],
  sun: { core: '#fffbe8', rim: '#fff0b8', glow: ['#f6d6a0', '#fbe4b0', '#fff0c4'] },
  cloud: ['#8a84b0', '#c0a6b8', '#fbe4b0'],
  stone: ['#2e2238', '#4a3248', '#6c4652', '#94605a', '#bc8262', '#e0a86e', '#f6d08c'],
  far: ['#8e86ac', '#a69cb8'],
  jungle: ['#2a2e2c', '#3a4232', '#566036', '#e0a86e'],
  grass: ['#4a5a34', '#6a7a3c', '#94944a'],
  robe: ['#b04e1a', '#ec8424'],
  mote: ['#fff0b8', '#f6d08c'],
};

const SUNRISE = [
  '#141838',
  '#22244e',
  '#3c2c62',
  '#622f6c',
  '#923a6c',
  '#c64e62',
  '#ea7458',
  '#f9a35a',
  '#fdd07a',
];

export const ANGKOR_SUNRISE_ART = {
  sky: SUNRISE,
  sun: { core: '#fffae0', rim: '#ffe7a0', glow: [SUNRISE[7], SUNRISE[8], '#fee2a0', '#fff1c8'] },
  cloud: ['#3c2c62', '#7a3468', '#f9a35a'],
  temple: ['#120d22', '#1c1430', '#2a1c3c', '#f9a35a'],
  jungle: ['#0e0b1c', '#171228', '#211932', '#c64e62'],
  water: ['#0e0b1c', '#2a1c3c'],
  lotus: ['#10221e', '#1e3a2e', '#e87a9a', '#ffc0cc'],
  glint: ['#fff1c8', '#fdd07a', '#f9a35a'],
  birds: '#120d22',
  stars: ['#fff4e0', '#b8a8e0'],
};
