import { randomBetween } from '../../lib/math.js';
import { linearCurve } from './curves.js';
import { layer } from './layer.js';

// a cluster of bright tones, [Hz, dB below the loudest], each wavering a little in pitch so the
// cluster sparkles instead of humming, over a band of hiss at its centre
export function shimmer(track, { partials, center, length, level, fadeFrom }) {
  const envelope = linearCurve([0, 0, 0.012, 1, fadeFrom, 0.9, length, 0]);
  for (const [frequency, decibels] of partials) {
    const rate = randomBetween(5, 11);
    const phase = randomBetween(0, 6.3);
    const pitch = (time) => frequency * (1 + 0.004 * Math.sin(phase + 2 * Math.PI * rate * time));
    const gain = level * Math.pow(10, decibels / 20);
    layer(track, { wave: 'sine', frequency: pitch, envelope, length, level: gain });
  }
  layer(track, {
    filter: 'bandpass',
    resonance: 3,
    cutoff: center,
    envelope,
    length,
    level: level * 2.2,
  });
}
