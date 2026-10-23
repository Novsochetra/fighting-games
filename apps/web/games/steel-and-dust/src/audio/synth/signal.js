import { asCurve } from './curves.js';
import { createStateVariableFilter } from './state-variable-filter.js';

// a phase from 0 to 1 that follows a pitch curve, starting anywhere
export function phasor(frequency, sampleRate) {
  const frequencyAt = asCurve(frequency);
  let phase = Math.random();
  return (time) => {
    phase += frequencyAt(time) / sampleRate;
    phase -= Math.floor(phase);
    return phase;
  };
}

// like layer, for any source: source(sampleRate) gives (time) => sample, which goes through an
// optional filter and drive, then the envelope
export function signal(track, params) {
  const { samples, sampleRate } = track;
  const first = Math.round((params.start || 0) * sampleRate);
  const count = Math.min(samples.length - first, Math.ceil(params.length * sampleRate));
  const envelope = asCurve(params.envelope ?? 1);
  const filter = params.filter ? createStateVariableFilter(params, sampleRate) : null;
  const source = params.source(sampleRate);
  const level = params.level ?? 1;
  for (let i = 0; i < count; i++) {
    const time = i / sampleRate;
    let x = source(time);
    if (filter) {
      x = filter(x, i, time);
    }
    if (params.drive) {
      x = Math.tanh(x * params.drive);
    }
    samples[first + i] += x * envelope(time) * level;
  }
}
