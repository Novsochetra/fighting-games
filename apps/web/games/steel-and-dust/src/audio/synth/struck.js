import { glide } from './curves.js';
import { layer } from './layer.js';

// metal: inharmonic partials, the higher ones quieter and shorter
export function bell(track, { base, ratios, decay, level, start }) {
  ratios.forEach((ratio, i) =>
    layer(track, {
      wave: i % 2 ? 'sine' : 'triangle',
      frequency: base * ratio,
      attack: 0.001,
      decay: decay * (1 - i * 0.14),
      level: level / (1 + i * 0.7),
      start,
    }),
  );
}

export function woodKnock(track, frequency, start) {
  const pitch = glide(frequency, 0.06, frequency * 0.8);
  layer(track, {
    wave: 'triangle',
    frequency: pitch,
    attack: 0.001,
    decay: 0.06,
    level: 0.45,
    start,
  });
}

// the strike that sets things ringing: a click plus a short burst of noise (lowpass darkens it),
// dying away over a few milliseconds
export function excitation({ milliseconds, lowpass, click }, sampleRate) {
  const length = Math.max(1, Math.round((milliseconds * sampleRate) / 1000));
  const strike = new Float32Array(length);
  const smoothing = lowpass ? 1 - Math.exp((-2 * Math.PI * lowpass) / sampleRate) : 1;
  let level = 0;
  for (let i = 0; i < length; i++) {
    level += (Math.random() * 2 - 1 - level) * smoothing;
    strike[i] = level * Math.exp((-5 * i) / length);
  }
  strike[0] += click || 0;
  return strike;
}

function ringMode(scratch, strike, [frequency, seconds], sampleRate) {
  const radius = Math.exp(-6.9 / (seconds * sampleRate));
  const angle = (2 * Math.PI * Math.min(frequency, sampleRate * 0.45)) / sampleRate;
  const b1 = 2 * radius * Math.cos(angle);
  const b2 = -radius * radius;
  const length = Math.min(scratch.length, Math.ceil(seconds * sampleRate));
  let y1 = 0;
  let y2 = 0;
  let loudest = 0;
  for (let i = 0; i < length; i++) {
    const y = (i < strike.length ? strike[i] : 0) + b1 * y1 + b2 * y2;
    y2 = y1;
    y1 = y;
    scratch[i] = y;
    if (Math.abs(y) > loudest) {
      loudest = Math.abs(y);
    }
  }
  return { length, loudest };
}

// a struck object: resonant modes [frequency, seconds to die away, level], all rung by one strike.
// Low, damped modes thud like flesh and bone; high, long ones make metal ring
export function modes(track, strike, list, start) {
  const { samples, sampleRate } = track;
  const first = Math.round((start || 0) * sampleRate);
  const scratch = new Float32Array(samples.length - first);
  for (const mode of list) {
    const { length, loudest } = ringMode(scratch, strike, mode, sampleRate);
    if (loudest > 0) {
      for (let i = 0; i < length; i++) {
        samples[first + i] += (scratch[i] / loudest) * mode[2];
      }
    }
  }
}

// a resonator from the bank tables: { strike, modes, start }, its mode frequencies scaled by pitch
export function ring(track, resonator, pitch) {
  const strike = excitation(resonator.strike, track.sampleRate);
  const tuned = resonator.modes.map(([frequency, seconds, level]) => [
    frequency * pitch,
    seconds,
    level,
  ]);
  modes(track, strike, tuned, resonator.start);
}
