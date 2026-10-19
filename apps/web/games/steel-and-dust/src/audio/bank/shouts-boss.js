import { shout } from './shout.js';

// Warden Ox: a growl from a bigger chest (lower formants, wider bands)
const CHEST = { formantScale: 0.82, bandwidthScale: 1.3 };

export const BOSS_SHOUTS = [
  shout({
    length: 0.36,
    pitch: [0, 100, 0.05, 125, 0.36, 80],
    vowels: [0, 'o', 0.12, 'V', 0.36, 'U'],
    envelope: [0, 0, 0.03, 1, 0.22, 0.8, 0.36, 0],
    breath: 0.2,
    rough: 0.6,
    openQuotient: 0.45,
    sub: 0.35,
    ...CHEST,
  }),
  shout({
    length: 0.32,
    pitch: [0, 110, 0.04, 135, 0.32, 88],
    vowels: [0, 'a', 0.32, 'V'],
    envelope: [0, 0, 0.025, 1, 0.18, 0.8, 0.32, 0],
    breath: 0.2,
    rough: 0.55,
    openQuotient: 0.45,
    sub: 0.3,
    ...CHEST,
  }),
];

export const BOSS_KO_SHOUTS = [
  shout({
    length: 1.2,
    pitch: [0, 90, 0.12, 150, 0.65, 135, 1.2, 65],
    vowels: [0, 'o', 0.12, 'a', 0.75, 'a', 1.2, 'V'],
    envelope: [0, 0, 0.06, 1, 0.8, 0.85, 1.2, 0],
    breath: 0.2,
    rough: [0, 0.4, 1.2, 0.7],
    openQuotient: 0.45,
    sub: [0, 0.2, 0.7, 0.3, 1.2, 0.6],
    vibrato: { rate: 5, depth: 0.03 },
    ...CHEST,
  }),
];
