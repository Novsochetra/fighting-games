import { glide } from '../synth/curves.js';
import { layer } from '../synth/layer.js';
import { bell } from '../synth/struck.js';

// a note held for `seconds` and let go fast, as an arcade chip plays it
function gate(seconds) {
  return (time) => {
    if (time < 0.003) {
      return time / 0.003;
    }
    return time < seconds ? 1 : Math.max(0, 1 - (time - seconds) / 0.01);
  };
}

function chip(track, { frequency, start, hold, decay, level }) {
  const envelope = decay
    ? (time) => (time < 0.003 ? time / 0.003 : Math.exp((-6.9 * time) / decay))
    : gate(hold);
  const length = decay || hold + 0.012;
  const shape = { wave: 'square', frequency, filter: 'lowpass', cutoff: 5200, resonance: 0.7 };
  layer(track, { ...shape, start, length, envelope, level });
  layer(track, {
    wave: 'sine',
    frequency: frequency * 2,
    start,
    length,
    envelope,
    level: level * 0.25,
  });
}

// the arcade coin: a short low note leaping a fourth to a ringing high one. No take pitch, since a
// run of coins climbs a scale through the playback rate (sim/items/loot-collect.js)
function buildCoin(track) {
  chip(track, { frequency: 988, start: 0, hold: 0.05, level: 0.5 });
  chip(track, { frequency: 1319, start: 0.055, decay: 0.32, level: 0.6 });
  return { lowpass: 9000 };
}

// a coin striking the road: a tiny bright ring
function buildClink(track, pitch) {
  bell(track, { base: 3400 * pitch, ratios: [1, 1.47, 2.09], decay: 0.07, level: 0.5 });
  layer(track, { filter: 'highpass', cutoff: 6000, attack: 0.0005, decay: 0.012, level: 0.4 });
  return { lowpass: 11000 };
}

// a gem: a glassy run up a major chord, its last note left to ring over a high shimmer
function buildGem(track, pitch) {
  [1568, 1976, 2349, 3136].forEach((frequency, i) => {
    const start = i * 0.042;
    const decay = i === 3 ? 0.5 : 0.22;
    bell(track, { base: frequency * pitch, ratios: [1, 2.01, 3.03], decay, level: 0.5, start });
  });
  const shimmer = { filter: 'bandpass', cutoff: glide(6000, 0.4, 9500), resonance: 2 };
  layer(track, { ...shimmer, attack: 0.08, decay: 0.35, level: 0.12, start: 0.04 });
  return { lowpass: 12000 };
}

// a crisp bite: two crunches of filtered noise and the soft thud of the jaw
function buildAppleBite(track, pitch) {
  [0, 0.06].forEach((start) => {
    const crunch = { filter: 'bandpass', cutoff: 2600 * pitch, resonance: 1.4, drive: 3 };
    layer(track, { ...crunch, attack: 0.001, decay: 0.045, level: 0.7, start });
  });
  layer(track, {
    wave: 'sine',
    frequency: glide(180, 0.05, 90),
    attack: 0.001,
    decay: 0.06,
    level: 0.5,
  });
  return { drive: 1.4 };
}

// loot never outranks a blow landing (priority 2) when every voice is busy
const piece = (build, { level, takes, seconds, priority }) => ({
  group: 'loot',
  level,
  takes,
  seconds,
  priority,
  build,
});

export const LOOT_PIECE_SOUNDS = {
  coin: piece(buildCoin, { level: 0.3, takes: 1, seconds: 0.4, priority: 0 }),
  clink: piece(buildClink, { level: 0.14, takes: 3, seconds: 0.1, priority: 0 }),
  gem: piece(buildGem, { level: 0.36, takes: 2, seconds: 0.7, priority: 1 }),
  appleBite: piece(buildAppleBite, { level: 0.34, takes: 2, seconds: 0.14, priority: 1 }),
};
