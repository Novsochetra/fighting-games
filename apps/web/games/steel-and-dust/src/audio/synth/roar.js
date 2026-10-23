import { layer } from './layer.js';

const TAU = Math.PI * 2;

// a loudness flutter near `rate` times a second whose speed and depth drift at random, shared by
// every layer so the roar moves as one body; the reference roar flutters at about 29 Hz
function flutter(seconds, sampleRate, { rate, depth }) {
  const curve = new Float32Array(Math.ceil(seconds * sampleRate) + 1);
  const drift = 1 - Math.exp((-TAU * 6) / sampleRate);
  const retarget = Math.round(sampleRate / 12);
  let phase = Math.random();
  let wander = 0;
  let wanderTarget = 0;
  for (let i = 0; i < curve.length; i++) {
    if (i % retarget === 0) {
      wanderTarget = Math.random() * 2 - 1;
    }
    wander += (wanderTarget - wander) * drift;
    phase += (rate * (1 + 0.25 * wander)) / sampleRate;
    const second = Math.sin(TAU * phase * 0.68 + 1.3);
    curve[i] = 1 + depth * (0.75 * Math.sin(TAU * phase) + 0.35 * second) * (0.8 + 0.2 * wander);
  }
  return (time) => curve[Math.min(curve.length - 1, Math.round(time * sampleRate))];
}

function holdThenFade(hold, fade) {
  return (time) => {
    if (time < 0.003) {
      return time / 0.003;
    }
    return time < hold ? 1 : Math.exp((-6.9 * (time - hold)) / fade);
  };
}

// a roar of noise that hits at once, holds, then fades: a heavy body band, a sub band, grit and air
// (levels in that order), all fluttering together
export function roar(track, spec) {
  const { start = 0, hold, fade, body = 130, sub = 75, grit = 1300 } = spec;
  const levels = spec.levels || [9, 3.8, 0.33, 0.11];
  const length = hold + fade;
  const rough = flutter(length, track.sampleRate, spec.flutter || { rate: 29, depth: 0.5 });
  const shape = holdThenFade(hold, fade);
  const envelope = (time) => shape(time) * rough(time);
  const common = { envelope, length, start };
  layer(track, { filter: 'bandpass', resonance: 2.8, cutoff: body, level: levels[0], ...common });
  layer(track, { filter: 'lowpass', resonance: 0.9, cutoff: sub, level: levels[1], ...common });
  layer(track, { filter: 'bandpass', resonance: 0.6, cutoff: grit, level: levels[2], ...common });
  layer(track, { filter: 'highpass', resonance: 0.7, cutoff: 3000, level: levels[3], ...common });
}
