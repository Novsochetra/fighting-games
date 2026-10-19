import { shout } from './shout.js';

// the Metal Slug death scream
export const DEATH_SHOUTS = [
  // "AAAAAGH!"
  shout({
    length: 0.8,
    pitch: [0, 420, 0.06, 560, 0.12, 545, 0.45, 520, 0.62, 470, 0.8, 300],
    vowels: [0, 'V', 0.05, 'A', 0.5, 'A', 0.68, 'V', 0.8, 'U'],
    envelope: [0, 0, 0.025, 1, 0.5, 0.9, 0.68, 0.7, 0.8, 0],
    breath: [0, 0.3, 0.04, 0.1, 0.6, 0.15, 0.8, 0.35],
    rough: [0, 0.15, 0.4, 0.3, 0.8, 0.55],
    openQuotient: [0, 0.5, 0.5, 0.42, 0.8, 0.6],
    sub: [0, 0, 0.55, 0, 0.8, 0.5],
    vibrato: { rate: 6.5, depth: 0.02 },
    tail: true,
  }),
  // "UWAAAAH!"
  shout({
    length: 0.78,
    pitch: [0, 330, 0.1, 500, 0.4, 510, 0.6, 460, 0.78, 280],
    vowels: [0, 'u', 0.06, 'u', 0.17, 'A', 0.5, 'a', 0.65, 'a', 0.78, 'o'],
    envelope: [0, 0, 0.04, 0.6, 0.15, 1, 0.55, 0.85, 0.78, 0],
    breath: [0, 0.2, 0.1, 0.1, 0.78, 0.3],
    rough: [0, 0.1, 0.5, 0.3, 0.78, 0.5],
    openQuotient: 0.48,
    sub: [0, 0, 0.6, 0, 0.78, 0.45],
    vibrato: { rate: 6, depth: 0.025 },
  }),
  // "GYAAAH!"
  shout({
    length: 0.58,
    pitch: [0, 600, 0.05, 700, 0.25, 660, 0.45, 560, 0.58, 380],
    vowels: [0, 'i', 0.04, 'ae', 0.1, 'A', 0.45, 'A', 0.58, 'V'],
    envelope: [0, 0, 0.015, 1, 0.38, 0.85, 0.58, 0],
    breath: [0, 0.15, 0.4, 0.12, 0.58, 0.35],
    rough: [0, 0.2, 0.58, 0.5],
    openQuotient: 0.42,
    sub: [0, 0, 0.45, 0, 0.58, 0.4],
    vibrato: { rate: 7, depth: 0.02 },
    start: 0.015,
    burst: true,
  }),
  // "OAAARGH!"
  shout({
    length: 0.66,
    pitch: [0, 240, 0.05, 330, 0.3, 310, 0.5, 270, 0.66, 160],
    vowels: [0, 'o', 0.08, 'a', 0.32, 'a', 0.42, 'r', 0.66, 'U'],
    envelope: [0, 0, 0.03, 1, 0.42, 0.8, 0.66, 0],
    breath: 0.14,
    rough: [0, 0.35, 0.66, 0.6],
    openQuotient: 0.45,
    sub: [0, 0.1, 0.4, 0.2, 0.66, 0.6],
    vibrato: { rate: 5, depth: 0.02 },
    tail: true,
  }),
  // "AIEEEE!"
  shout({
    length: 0.75,
    pitch: [0, 560, 0.08, 760, 0.3, 800, 0.55, 740, 0.75, 520],
    vowels: [0, 'A', 0.12, 'A', 0.25, 'E', 0.4, 'i', 0.75, 'i'],
    envelope: [0, 0, 0.03, 1, 0.55, 0.85, 0.75, 0],
    breath: 0.1,
    rough: [0, 0.1, 0.75, 0.35],
    openQuotient: 0.45,
    vibrato: { rate: 7.5, depth: 0.03 },
  }),
];
