import { asCurve } from './curves.js';

const OUTPUTS = {
  lowpass: (input, band, low) => low,
  bandpass: (input, band, low, damping) => band * damping,
  highpass: (input, band, low, damping) => input - damping * band - low,
};

// a trapezoidal state variable filter (Simper); the cutoff is re-tuned every 8 samples
export function createStateVariableFilter(params, sampleRate) {
  const cutoffAt = asCurve(params.cutoff || 1000);
  const damping = 1 / (params.resonance || 0.707);
  const output = OUTPUTS[params.filter] || OUTPUTS.highpass;
  const state = { bandMemory: 0, lowMemory: 0, a1: 0, a2: 0, a3: 0 };
  return (input, index, time) => {
    if ((index & 7) === 0) {
      const warped = Math.tan((Math.PI * Math.min(cutoffAt(time), sampleRate * 0.45)) / sampleRate);
      state.a1 = 1 / (1 + warped * (warped + damping));
      state.a2 = warped * state.a1;
      state.a3 = warped * state.a2;
    }
    const v3 = input - state.lowMemory;
    const band = state.a1 * state.bandMemory + state.a2 * v3;
    const low = state.lowMemory + state.a2 * state.bandMemory + state.a3 * v3;
    state.bandMemory = 2 * band - state.bandMemory;
    state.lowMemory = 2 * low - state.lowMemory;
    return output(input, band, low, damping);
  };
}
