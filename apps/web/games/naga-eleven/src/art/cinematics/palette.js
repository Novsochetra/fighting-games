// the broadcast graphics' own colours; every ramp runs deep to light, cooler as it darkens and
// warmer as it lightens, and a team's plates and bars take its kit's ramps (src/art/kits.js)
export const CINE = {
  ink: '#05070e',
  panel: ['#090d1e', '#101832', '#1a264a', '#283a68'],
  inset: '#04060f',
  text: '#f6f2e6',
  muted: '#9aa6c4',
  dim: '#02030a',
  letterbox: '#020308',
  white: '#ffffff',
  flash: '#fffbea',
  gold: ['#6e3a0c', '#c47a1c', '#ffcc48', '#fff2a8'],
  replay: ['#4a0814', '#9a1626', '#e2363a', '#ff9a78'],
  jade: ['#0a3a30', '#16745a', '#2fb487', '#a8f0c8'],
  silver: ['#4a5470', '#7a86a6', '#b8c2d8', '#eef2f8'],
};

// a team that names no kit wears one of these, home first
export const FALLBACK_KITS = [
  {
    shirt: ['#5a0e1c', '#9a1a26', '#d8302e', '#ff8a5e'],
    shorts: ['#b8bcd0', '#d6d8e4', '#f4f2ec', '#ffffff'],
    socks: ['#5a0e1c', '#9a1a26', '#d8302e', '#ff8a5e'],
    trim: ['#7a4a10', '#c4801e', '#ffd04a', '#fff2a8'],
  },
  {
    shirt: ['#0c1e5a', '#1a3a9a', '#2f6fd6', '#8ac8ff'],
    shorts: ['#0c1030', '#141c48', '#1f2c5a', '#34467e'],
    socks: ['#b8bcd0', '#d6d8e4', '#f4f2ec', '#ffffff'],
    trim: ['#2a6a8a', '#4aa0c8', '#9fe3ff', '#e8fbff'],
  },
];

// the paper that rains on a win, besides the winners' own colours
export const CONFETTI_SPARKLE = ['#ffffff', '#ffe27a'];
