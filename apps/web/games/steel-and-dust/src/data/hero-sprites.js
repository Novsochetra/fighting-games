import { RENDER_SCALE } from '../config.js';

export const HERO_SPRITES = {
  frameWidth: 128,
  frameHeight: 80,
  feetX: 64,
  feetY: 76,
  scale: 1 / RENDER_SCALE,
  frames: {
    idle: 6,
    walk: 8,
    jump: 8,
    land: 4,
    dash: 4,
    hurt: 4,
    juggle: 4,
    down: 4,
    getup: 5,
    ko: 4,
    win: 4,
    slash1: 5,
    slash2: 5,
    spin_slash: 6,
    thrust: 6,
    rising_dragon: 6,
    cleave: 8,
    air_slash: 4,
    air_rising_cut: 4,
    meteor_slash: 4,
    plunge: 4,
  },
};

// move id -> [strip, strike frame]; a move's own `sprite` wins over this table
export const HERO_MOVE_SPRITES = {
  L1: ['slash1', 2],
  L2: ['slash2', 3],
  L3: ['spin_slash', 3],
  L4: ['thrust', 3],
  LLK: ['rising_dragon', 2],
  UK: ['rising_dragon', 2],
  K1: ['cleave', 3],
  AL: ['air_slash', 2],
  AL2: ['air_rising_cut', 2],
  AK: ['meteor_slash', 3],
  ADK: ['plunge', 2],
};

export const ULT_SPRITES = [
  ['slash1', 2],
  ['slash2', 3],
  ['spin_slash', 3],
  ['thrust', 3],
];
