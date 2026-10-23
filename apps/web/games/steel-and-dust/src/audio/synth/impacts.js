import { randomBetween } from '../../lib/math.js';
import { expCurve, glide } from './curves.js';
import { layer } from './layer.js';

// the first millisecond of a really hard hit: a pressure spike that swings negative (an N-wave)
// plus a tick of bright noise
export function crack(track, { start = 0, level = 1, width = 0.0012 }) {
  const { samples, sampleRate } = track;
  const first = Math.round(start * sampleRate);
  const length = Math.max(4, Math.round(width * sampleRate));
  for (let i = 0; i < length && first + i < samples.length; i++) {
    const progress = i / length;
    samples[first + i] += (1 - 2 * progress) * (1 - progress * 0.3) * level;
  }
  layer(track, { filter: 'highpass', cutoff: 2500, attack: 0.0002, decay: 0.006, level, start });
}

// a pitched body that drops (a kick, a boom), driven so a phone speaker still hears its overtones
export function boom(track, { start = 0, from, to, glideTime, decay, level, drive = 1.6 }) {
  const frequency = glide(from, glideTime || decay * 0.5, to);
  layer(track, { wave: 'sine', frequency, attack: 0.0008, decay, level, drive, start });
}

// a burst of noise in a band that glides from `from` to `to` (a slice, a smack, a gush)
export function burst(track, spec) {
  const { from, to, time, decay } = spec;
  layer(track, {
    filter: spec.filter || 'bandpass',
    resonance: spec.resonance || 1,
    cutoff: to ? glide(from, time || decay, to) : from,
    attack: 0.0006,
    decay,
    level: spec.level,
    drive: spec.drive,
    start: spec.start || 0,
  });
}

function rollingEnvelope(length, rolls) {
  const bumps = Array.from({ length: rolls }, (_, i) => [
    (i / rolls) * length * 0.7 + randomBetween(0, 0.06),
    randomBetween(0.5, 1),
  ]);
  return (time) => {
    const fade = Math.exp((-4.5 * time) / length);
    const roll = bumps.reduce(
      (sum, [at, size]) => sum + size * Math.exp(-Math.pow((time - at) / 0.07, 2)),
      0.35,
    );
    return Math.min(1.2, roll) * fade * Math.min(1, time / 0.004);
  };
}

// low noise whose loudness rolls unevenly as it fades: thunder, a collapse, a blast's tail
export function rumble(track, { start = 0, length, from, to, level, rolls }) {
  layer(track, {
    filter: 'lowpass',
    resonance: 0.8,
    cutoff: expCurve([0, from, length * 0.6, to]),
    envelope: rollingEnvelope(length, rolls),
    length,
    level,
    start,
  });
}
