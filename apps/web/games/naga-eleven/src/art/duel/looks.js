import { COMBO_LOOK_ART } from './looks-combos.js';
import { SKILL_LOOK_ART } from './looks-skills.js';
import { STAR_LOOK_ART } from './looks-stars.js';

// each move's colours by its look: `body` is its main ramp (deep to light), `accent` its second,
// `eye` what burns in it, `sky` the two shades behind it in the clash, `word` the ramp its name is
// set in. The pitch's effects draw in them too (README "On the pitch")
export const LOOK_ART = { ...STAR_LOOK_ART, ...SKILL_LOOK_ART, ...COMBO_LOOK_ART };

// the figures in a clash are shadows lit along their top edge by the light of the move
export const FIGURE_ART = { body: '#0b0a14', rim: '#fff4d0', shade: '#1c1a2c' };

export const BALL_ART = {
  ink: '#0a0912',
  ramp: ['#8a92a8', '#c8cede', '#f4f6fa', '#ffffff'],
  patch: ['#14141c', '#2a2c3a'],
};
