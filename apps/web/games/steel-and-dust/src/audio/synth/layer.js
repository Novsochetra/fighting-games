import { asCurve } from './curves.js';
import { createStateVariableFilter } from './state-variable-filter.js';

const WAVES = {
  sine: (phase) => Math.sin(phase * 6.2832),
  triangle: (phase) => 1 - 4 * Math.abs(phase - 0.5),
  square: (phase) => (phase < 0.5 ? 1 : -1),
  sawtooth: (phase) => 2 * phase - 1,
};

function strikeEnvelope(attack, decay) {
  return (time) => (time < attack ? time / attack : Math.exp((-6.9 * (time - attack)) / decay));
}

function createSource(params, sampleRate) {
  let phase = Math.random();
  if (!params.wave || params.wave === 'noise') {
    return () => Math.random() * 2 - 1;
  }
  const frequencyAt = asCurve(params.frequency || 0);
  const shape = WAVES[params.wave] || WAVES.sawtooth;
  return (time) => {
    phase += frequencyAt(time) / sampleRate;
    phase -= Math.floor(phase);
    return shape(phase);
  };
}

// one layer added into the track: noise or a waveform -> optional filter -> optional drive -> envelope
export function layer(track, params) {
  const { samples, sampleRate } = track;
  const first = Math.round((params.start || 0) * sampleRate);
  const seconds = params.length || params.attack + params.decay;
  const count = Math.min(samples.length - first, Math.ceil(seconds * sampleRate));
  const envelope = params.envelope || strikeEnvelope(params.attack, params.decay);
  const level = params.level || 1;
  const source = createSource(params, sampleRate);
  const filter = params.filter ? createStateVariableFilter(params, sampleRate) : null;
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
