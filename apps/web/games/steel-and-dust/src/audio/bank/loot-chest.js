import { expCurve, glide } from '../synth/curves.js';
import { layer } from '../synth/layer.js';
import { bell, woodKnock } from '../synth/struck.js';

// a heavy chest dropping onto the road: a deep thud, the boards knocking, the iron bands clanking
function buildChestLand(track, pitch) {
  const thud = glide(120 * pitch, 0.18, 48);
  layer(track, { wave: 'sine', frequency: thud, attack: 0.001, decay: 0.3, level: 1.1 });
  layer(track, {
    filter: 'lowpass',
    cutoff: glide(1400, 0.2, 120),
    attack: 0.002,
    decay: 0.22,
    level: 1.6,
  });
  woodKnock(track, 260 * pitch, 0);
  woodKnock(track, 205 * pitch, 0.035);
  bell(track, {
    base: 640 * pitch,
    ratios: [1, 2.41, 3.93],
    decay: 0.22,
    level: 0.3,
    start: 0.004,
  });
  return { drive: 2 };
}

// the lid straining against its lock: quick wooden knocks with a jingle of coins inside
function buildChestRattle(track, pitch) {
  [0, 0.065, 0.13, 0.2].forEach((start, i) => {
    woodKnock(track, (i % 2 ? 340 : 400) * pitch, start);
    bell(track, {
      base: (2600 + i * 180) * pitch,
      ratios: [1, 1.5],
      decay: 0.05,
      level: 0.18,
      start,
    });
  });
  return { drive: 1.4 };
}

// the creak of the lid, a rush of air, and the treasure's light rising in a bright chord
function buildChestOpen(track, pitch) {
  const creak = { wave: 'sawtooth', frequency: expCurve([0, 170, 0.1, 260, 0.2, 420]) };
  layer(track, {
    ...creak,
    filter: 'bandpass',
    cutoff: 900,
    resonance: 3,
    attack: 0.01,
    decay: 0.18,
    level: 0.35,
  });
  const rush = { filter: 'bandpass', cutoff: glide(500, 0.35, 4200), resonance: 1.2 };
  layer(track, { ...rush, attack: 0.12, decay: 0.3, level: 0.45, start: 0.08 });
  [1047, 1319, 1568, 2093, 2637].forEach((frequency, i) => {
    const start = 0.16 + i * 0.05;
    bell(track, {
      base: frequency * pitch,
      ratios: [1, 2.01, 3.02],
      decay: 0.8,
      level: 0.32,
      start,
    });
  });
  [523, 659, 784].forEach((frequency) => {
    layer(track, {
      wave: 'triangle',
      frequency: frequency * pitch,
      attack: 0.25,
      decay: 0.85,
      level: 0.12,
      start: 0.16,
    });
  });
  return { lowpass: 11000 };
}

const chestSound = (build, { level, seconds }) => ({
  group: 'loot',
  level,
  takes: 1,
  seconds,
  priority: 2,
  build,
});

export const LOOT_CHEST_SOUNDS = {
  chestLand: chestSound(buildChestLand, { level: 0.55, seconds: 0.45 }),
  chestRattle: chestSound(buildChestRattle, { level: 0.32, seconds: 0.32 }),
  chestOpen: chestSound(buildChestOpen, { level: 0.5, seconds: 1.15 }),
};
