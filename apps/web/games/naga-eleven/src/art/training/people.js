import { HAIRS, SKINS } from '../actors.js';
import { rampOf } from '../ramp.js';

// Sochetra's training kit, which the match's footballer sheets and the meditator are coloured in
export const SOCHETRA = {
  kit: { shirt: '#d8413a', shorts: '#f4f1e8', socks: '#d8413a', trim: '#ffd25a' },
};

// the same kit in four-shade ramps, which the match's footballer sheets are recoloured to; the red
// is ramped by hand, as a ramp worked out from it lights to salmon pink; his face is his match face
const TRAINING_RED = ['#5e1024', '#9c1d2b', SOCHETRA.kit.shirt, '#e8523a'];

export const SOCHETRA_LOOK = {
  shirt: TRAINING_RED,
  shorts: rampOf(SOCHETRA.kit.shorts),
  socks: TRAINING_RED,
  trim: rampOf(SOCHETRA.kit.trim),
  skin: SKINS.khmer,
  hair: HAIRS.black,
  key: 'training:sochetra',
};

// the sheets' own outline and eye white, which the figures drawn by hand share
export const FIGURE = { outline: '#000000', eye: '#f2eae0' };

// Coach Vannak's cap (his portrait's), his tracksuit over his white teacher's shirt, the whistle
// on its red cord, his clipboard and his trainers
export const COACH = {
  cap: ['#14234a', '#2e5498', '#3f6cb8', '#5a8ad0'],
  tracksuit: ['#121629', '#1e2540', '#2d3a63', '#45588e'],
  stripe: '#e8ecf2',
  collar: ['#b6bac8', '#ffffff'],
  whistle: ['#a8740e', '#ffd25a'],
  cord: '#d8343c',
  board: ['#5b3a25', '#9c6e43'],
  paper: ['#9aa3b8', '#f4f1e8'],
  clip: ['#7b8494', '#c9cfd8'],
  shoes: ['#4b5260', '#b8c2cc', '#f4f1e8'],
  skin: SKINS.khmer,
  hair: HAIRS.black,
};

export const BALL = {
  white: '#f7f7f2',
  shade: '#c4c6d2',
  patch: '#1b1b22',
  outline: '#22222a',
  trail: '#ffffff',
};
