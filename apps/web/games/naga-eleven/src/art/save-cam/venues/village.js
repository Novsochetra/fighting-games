import { VILLAGE_FIELD } from '../../venues/village-field.js';

// The save cam at Chrey's village field, from the penalty spot on a bright morning: the venue's own
// colours for the sky, the field, the paddies and the village behind, and the few shades a front
// view of its bamboo goal and the far haze need. Ramps run deep to light
export const SAVE_CAM_VILLAGE = {
  sky: VILLAGE_FIELD.sky,
  cloud: VILLAGE_FIELD.cloud,
  grass: VILLAGE_FIELD.grass,
  dirt: VILLAGE_FIELD.dirt,
  water: VILLAGE_FIELD.water,
  rice: VILLAGE_FIELD.rice,
  lime: VILLAGE_FIELD.lime,
  wood: VILLAGE_FIELD.wood,
  tin: VILLAGE_FIELD.tin,
  thatch: VILLAGE_FIELD.thatch,
  palm: VILLAGE_FIELD.palm,
  tree: VILLAGE_FIELD.tree,
  haze: VILLAGE_FIELD.haze,
  wat: VILLAGE_FIELD.wat,
  kids: VILLAGE_FIELD.kids,
  // the village a long way off, its trees and roofs gone pale and blue in the morning air
  far: ['#7e9a9a', '#94aca6', '#a8bcb0', '#bccab8'],
  farRoof: ['#a08c80', '#b8a492'],
  egret: ['#9aa0b0', '#f8f6f0'],
  shadow: '#3a2418',
  goal: {
    post: VILLAGE_FIELD.bamboo,
    rope: ['#7c6a48', VILLAGE_FIELD.rope],
    net: ['#8a826c', '#b8ae94', VILLAGE_FIELD.net],
  },
};
