import { BOOTS } from '../../actors.js';
import { BALL_PALETTE } from '../../duel/ball.js';
import { DUEL_INK } from '../../duel/palette.js';

// The letters of the dive's maps. These wear the keeper's own look: a part of it and its shade,
// deep to light, so every keeper dives in his own kit, skin and hair
export const DIVE_KIT_LETTERS = {
  a: ['shirt', 0],
  b: ['shirt', 1],
  c: ['shirt', 2],
  d: ['shirt', 3],
  e: ['shorts', 0],
  f: ['shorts', 1],
  g: ['shorts', 2],
  h: ['shorts', 3],
  i: ['socks', 0],
  j: ['socks', 1],
  k: ['socks', 2],
  l: ['socks', 3],
  m: ['trim', 0],
  n: ['trim', 1],
  o: ['trim', 2],
  p: ['trim', 3],
  s: ['skin', 0],
  t: ['skin', 1],
  u: ['skin', 2],
  v: ['skin', 3],
  w: ['hair', 0],
  x: ['hair', 1],
  y: ['hair', 2],
  z: ['hair', 3],
};

// pale gloves, so they read against any kit and apart from the white ball
const GLOVE = ['#6a6458', '#a8a294', '#dcd6c4', '#f6f2e2'];

// and these are the same on every keeper: the outline, the eyes' whites, gloves, boots and ball
export const DIVE_INKS = {
  0: DUEL_INK,
  E: '#f7f3e8',
  G: GLOVE[0],
  H: GLOVE[1],
  I: GLOVE[2],
  J: GLOVE[3],
  K: BOOTS[0],
  L: BOOTS[1],
  M: BOOTS[2],
  N: BOOTS[3],
  R: BALL_PALETTE[1],
  S: BALL_PALETTE[2],
  T: BALL_PALETTE[3],
  U: BALL_PALETTE[4],
  P: BALL_PALETTE.p,
  Q: BALL_PALETTE.q,
};
