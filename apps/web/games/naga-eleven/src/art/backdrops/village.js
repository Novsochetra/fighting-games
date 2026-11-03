// Chrey village by the Mekong, seen into the low sun: at dawn the sky runs indigo to peach and
// the flooded paddies hold it; at dusk it burns orange to violet and the lamps come on. Near
// things stand dark against the light with a warm rim where the sun catches their edge.

const DAWN_SKY = ['#2b2452', '#4a3164', '#753f73', '#a7547a', '#d4707c', '#f09a82', '#fbc48e'];

const DAWN_SHADOW = ['#1e1830', '#2c2240', '#3e2c4c', '#5a3a5a'];

export const VILLAGE_DAWN_ART = {
  sky: DAWN_SKY,
  sun: { core: '#fff8e2', rim: '#ffe2a0', glow: [DAWN_SKY[6], '#fdd29a', '#ffe2a0'] },
  cloud: ['#4a3164', '#753f73', '#f09a82'],
  haze: ['#8a5274', '#a7547a'],
  hazeNear: ['#6e4468', '#8a5274'],
  shadow: DAWN_SHADOW,
  rim: ['#c88458', '#fbc48e'],
  rice: ['#7a5a66', '#4a5038', '#353c2c', '#6a6a40'],
  earth: ['#3a2428', '#6a3a30', '#9a5a40', '#c88458'],
  path: ['#5a3432', '#8a4e40', '#b46a4c', '#d48a5c'],
  roof: ['#3e2c4c', '#5a3a5a'],
  bamboo: ['#7a6440', '#b09a64'],
  ball: ['#1e1830', '#8a8090', '#e8e0dc'],
  ripple: '#d4707c',
  mist: ['#fbc48e30', '#fde0a850'],
  window: '#1e1830',
  lamp: '#fbc48e',
};

const DUSK_SKY = ['#151a3c', '#25234f', '#3f2a5e', '#6a3466', '#a2455e', '#d8644e', '#f29a4a'];

export const VILLAGE_DUSK_ART = {
  sky: DUSK_SKY,
  sun: { core: '#fff0b8', rim: '#ffcf6a', glow: [DUSK_SKY[6], '#ffbe5c', '#ffdf8a'] },
  cloud: ['#25234f', '#3f2a5e', '#d8644e'],
  haze: ['#5a3464', '#6a3466'],
  hazeNear: ['#41295a', '#5a3464'],
  shadow: ['#0f0f22', '#1a1730', '#28203e', '#3a2a4a'],
  rim: ['#b05a48', '#f29a4a'],
  rice: ['#4a3458', '#2e3a30', '#222c26', '#3e4a32'],
  earth: ['#1e1626', '#3a2430', '#5a3434', '#8a4c3c'],
  path: ['#2a1c2a', '#4a2c34', '#6a3c3c', '#8a4c3c'],
  roof: ['#28203e', '#3a2a4a'],
  bamboo: ['#4a3a34', '#7a5a44'],
  ball: ['#0f0f22', '#5a5468', '#b8aab0'],
  ripple: '#a2455e',
  mist: ['#d8644e20', '#f29a4a30'],
  window: '#0f0f22',
  lamp: '#ffcf6a',
  flame: ['#ffdf8a', '#fff0b8', '#ffbe5c'],
  firefly: ['#e8ff8a', '#b8e85a', '#6a8a3a'],
  stars: ['#fff0d8', '#b8b0e0', '#8a80c0'],
};
