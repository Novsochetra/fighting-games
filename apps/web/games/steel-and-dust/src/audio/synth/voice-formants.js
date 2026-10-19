import { clamp } from '../../lib/math.js';
import { VOWELS } from './vowels.js';

const FORMANT_COUNT = 5;
const UPPER_FORMANTS = [3400, 4300];

export function createFormants() {
  return {
    memory: new Float64Array(FORMANT_COUNT * 2),
    gainA: new Float64Array(FORMANT_COUNT),
    gainB: new Float64Array(FORMANT_COUNT),
    gainC: new Float64Array(FORMANT_COUNT),
  };
}

function vowelBlend(vowels, time) {
  let j = 0;
  while (j < vowels.length - 2 && time > vowels[j + 1][0]) {
    j++;
  }
  const from = vowels[j];
  const to = vowels[j + 1] || from;
  const blend = to[0] > from[0] ? clamp((time - from[0]) / (to[0] - from[0]), 0, 1) : 0;
  return { from: VOWELS[from[1]], to: VOWELS[to[1]], blend };
}

// five resonators that glide between the two vowels around `time`
export function retuneFormants(formants, shape, time) {
  const { from, to, blend } = vowelBlend(shape.vowels, time);
  const period = shape.period;
  for (let i = 0; i < FORMANT_COUNT; i++) {
    const base = i < 3 ? from[i] + (to[i] - from[i]) * blend : UPPER_FORMANTS[i - 3];
    const frequency = base * shape.formantScale;
    const radius = Math.exp(-Math.PI * shape.bandwidths[i] * period);
    formants.gainC[i] = -radius * radius;
    formants.gainB[i] = 2 * radius * Math.cos(6.2832 * frequency * period);
    formants.gainA[i] = 1 - formants.gainB[i] - formants.gainC[i];
  }
}

export function applyFormants(formants, input) {
  const { memory, gainA, gainB, gainC } = formants;
  let x = input;
  for (let i = 0; i < FORMANT_COUNT; i++) {
    const out = gainA[i] * x + gainB[i] * memory[i * 2] + gainC[i] * memory[i * 2 + 1];
    memory[i * 2 + 1] = memory[i * 2];
    memory[i * 2] = out;
    x = out;
  }
  return x;
}
