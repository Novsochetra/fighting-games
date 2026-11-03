// The village school on a clear morning and Kampong Cham High in the afternoon: ochre walls,
// blue shutters, terracotta roofs, red earth worn by a thousand games, the light from the top
// left. Ramps run dark to light.
const SKY = ['#3a6cc0', '#4a80cc', '#5e94d6', '#78a8de', '#96bce4', '#b8d0e8'];
const CLOUD = ['#a8b8d8', '#d8e2f0', '#f6f8fc'];
const WALL = ['#a8742c', '#d09a3c', '#e8bc58', '#f6d886'];
const DOOR = ['#1e3062', '#2e5a9a', '#4a7ac0'];
const ROOF = ['#6a2a1c', '#9a3e24', '#c25a30', '#dc7a44'];
const EARTH = ['#6e4228', '#9a5e38', '#c08250', '#dca870'];
const GREEN = ['#2a4a26', '#44702e', '#6a943a', '#98b44c'];

export const SCHOOL_YARD_ART = {
  sky: SKY,
  cloud: [...CLOUD, '#ffffff'],
  wall: WALL,
  trim: [CLOUD[0], CLOUD[2]],
  door: DOOR,
  roof: ROOF,
  earth: EARTH,
  green: GREEN,
  bamboo: [WALL[0], WALL[2], WALL[3]],
  flag: [DOOR[0], '#c8202a', CLOUD[2]],
  shadow: '#5a3a2a',
  haze: ['#8aa8b8', '#a8c0c8'],
  ball: ['#2a2430', '#a8a8b8', '#f6f8fc'],
  kids: { hair: '#1a1418', skin: '#9a603c', shirt: CLOUD[2], shorts: DOOR[0] },
};

const AFTERNOON_SKY = ['#4a76c0', '#6a8ec8', '#8ca6cc', '#b0bccc', '#d4cab8', '#ecd2a4'];

export const HIGH_SCHOOL_ART = {
  sky: AFTERNOON_SKY,
  cloud: ['#b0a8b8', '#e0d4cc', '#fbeedc', '#fff8ec'],
  wall: ['#a89a7a', '#cfc2a0', '#e8dcbc', '#fbf2da'],
  trim: ['#7a2a24', '#a8423a'],
  door: ['#3a2420', '#6a3a2a', '#8a5a3a'],
  roof: ['#4a2a2a', '#6e3a30', '#94503a', '#b86a48'],
  earth: ['#7a4a30', '#a46a44', '#c88c5c', '#e6b47a'],
  green: ['#2e4626', '#4a6a2e', '#74903a', '#a8b45a'],
  metal: ['#2a2a34', '#5a5a6a', '#9a9aa8', '#d8d8e0'],
  shadow: '#5a3a30',
  haze: ['#9aa6b0', '#c0bcb4'],
  ball: ['#2a2430', '#a8a8b8', '#f6f8fc'],
  bikes: ['#2a2a34', '#b8302a', '#2e5a9a', '#3a7a3a'],
};
