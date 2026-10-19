import { shout } from './shout.js';

// raiders, when hit
export const HURT_SHOUTS = [
  // "ugh!"
  shout({
    length: 0.2,
    pitch: [0, 190, 0.03, 240, 0.08, 230, 0.2, 150],
    vowels: [0, 'V', 0.1, 'V', 0.2, 'U'],
    envelope: [0, 0, 0.012, 1, 0.08, 0.85, 0.2, 0],
    breath: [0, 0.6, 0.03, 0.15, 0.2, 0.3],
    rough: 0.2,
    openQuotient: 0.5,
    sub: [0, 0, 0.12, 0, 0.2, 0.4],
  }),
  // "hah!"
  shout({
    length: 0.17,
    pitch: [0, 260, 0.04, 280, 0.17, 190],
    vowels: [0, 'a', 0.17, 'V'],
    envelope: [0, 0, 0.035, 1, 0.1, 0.7, 0.17, 0],
    breath: [0, 0.95, 0.04, 0.2],
    rough: 0.15,
    openQuotient: 0.5,
  }),
  // "guh!"
  shout({
    length: 0.17,
    pitch: [0, 230, 0.17, 160],
    vowels: [0, 'U', 0.17, 'u'],
    envelope: [0, 0, 0.012, 1, 0.09, 0.8, 0.17, 0],
    breath: 0.15,
    rough: 0.25,
    openQuotient: 0.5,
    start: 0.012,
    burst: true,
  }),
  // "ngh!"
  shout({
    length: 0.18,
    pitch: [0, 210, 0.04, 250, 0.18, 170],
    vowels: [0, 'u', 0.05, 'U', 0.18, 'U'],
    envelope: [0, 0, 0.02, 0.8, 0.06, 1, 0.18, 0],
    breath: 0.1,
    rough: 0.3,
    openQuotient: 0.45,
  }),
  // "oof!"
  shout({
    length: 0.2,
    pitch: [0, 220, 0.2, 150],
    vowels: [0, 'o', 0.2, 'u'],
    envelope: [0, 0, 0.02, 1, 0.1, 0.7, 0.2, 0],
    breath: [0, 0.7, 0.06, 0.25],
    rough: 0.15,
    openQuotient: 0.55,
  }),
  // "agh!"
  shout({
    length: 0.2,
    pitch: [0, 300, 0.03, 340, 0.2, 220],
    vowels: [0, 'a', 0.1, 'A', 0.2, 'V'],
    envelope: [0, 0, 0.015, 1, 0.1, 0.75, 0.2, 0],
    breath: 0.2,
    rough: 0.25,
    openQuotient: 0.45,
    tail: true,
  }),
];

// the hero, when hit
export const HERO_SHOUTS = [
  // "nngh"
  shout({
    length: 0.17,
    pitch: [0, 150, 0.03, 175, 0.17, 120],
    vowels: [0, 'U', 0.17, 'V'],
    envelope: [0, 0, 0.015, 1, 0.09, 0.7, 0.17, 0],
    breath: [0, 0.5, 0.04, 0.2],
    rough: 0.3,
    openQuotient: 0.5,
  }),
  // "hgh"
  shout({
    length: 0.16,
    pitch: [0, 170, 0.16, 130],
    vowels: [0, 'V', 0.16, 'U'],
    envelope: [0, 0, 0.02, 1, 0.08, 0.7, 0.16, 0],
    breath: [0, 0.85, 0.035, 0.25],
    rough: 0.25,
    openQuotient: 0.5,
  }),
  // "guh"
  shout({
    length: 0.19,
    pitch: [0, 150, 0.04, 170, 0.19, 115],
    vowels: [0, 'U', 0.19, 'u'],
    envelope: [0, 0, 0.015, 1, 0.1, 0.7, 0.19, 0],
    breath: 0.2,
    rough: 0.35,
    openQuotient: 0.5,
    start: 0.01,
    burst: true,
  }),
];
