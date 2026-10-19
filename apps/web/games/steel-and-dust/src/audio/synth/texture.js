import { randomBetween } from '../../lib/math.js';
import { layer } from './layer.js';

// tiny clicks scattered over the length, bunched at the start (bone, splinters, grit)
export function crackle(track, spec) {
  for (let i = 0; i < spec.count; i++) {
    const cutoff = spec.cutoff * randomBetween(0.7, 1.4);
    const decay = randomBetween(0.002, 0.006);
    const level = spec.level * randomBetween(0.5, 1);
    const start = spec.start + Math.pow(Math.random(), 1.7) * spec.length;
    layer(track, { filter: 'highpass', cutoff, attack: 0.0003, decay, level, start });
  }
}

// cloth or a cloak flapping: a band of noise that flutters `rate` times a second, slowing as it settles
export function flap(track, { start, length, cutoff, rate, level }) {
  const phase = Math.random() * 6;
  const envelope = (time) => {
    const progress = time / length;
    const swell = Math.sin(Math.PI * Math.min(1, progress * 3)) * (1 - progress);
    return swell * (0.5 + 0.5 * Math.sin(phase + time * rate * 6.2832 * (1 - 0.4 * progress)));
  };
  layer(track, { filter: 'bandpass', resonance: 1.2, cutoff, length, start, level, envelope });
}
