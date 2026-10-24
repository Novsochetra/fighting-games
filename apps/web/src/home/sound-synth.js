// Exponential ramps cannot reach zero, so a voice fades to this instead.
export const SILENCE = 0.0001;
const NOISE_SECONDS = 1;

const RAMP_METHODS = {
  set: 'setValueAtTime',
  linear: 'linearRampToValueAtTime',
  exponential: 'exponentialRampToValueAtTime',
};

export function envelopeSteps({ gain, attack, duration }, at) {
  return [
    { type: 'set', value: SILENCE, time: at },
    { type: 'linear', value: gain, time: at + attack },
    { type: 'exponential', value: SILENCE, time: at + duration },
  ];
}

export function frequencySteps({ frequency: [from, to], duration }, at) {
  const steps = [{ type: 'set', value: from, time: at }];
  return from === to ? steps : [...steps, { type: 'exponential', value: to, time: at + duration }];
}

function applySteps(param, steps) {
  for (const step of steps) {
    param[RAMP_METHODS[step.type]](step.value, step.time);
  }
}

export function createNoiseBuffer(context, seconds = NOISE_SECONDS) {
  const length = Math.round(context.sampleRate * seconds);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    samples[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function createTone(context, voice) {
  const oscillator = context.createOscillator();
  oscillator.type = voice.wave;
  return { source: oscillator, output: oscillator, pitch: oscillator.frequency };
}

function createNoise(context, voice, noiseBuffer) {
  const source = context.createBufferSource();
  source.buffer = noiseBuffer;
  const filter = context.createBiquadFilter();
  filter.type = voice.filter;
  filter.Q.value = voice.resonance;
  source.connect(filter);
  return { source, output: filter, pitch: filter.frequency };
}

export function scheduleVoice(context, { destination, noiseBuffer }, voice, startTime) {
  const at = startTime + voice.start;
  const parts =
    voice.kind === 'noise' ? createNoise(context, voice, noiseBuffer) : createTone(context, voice);
  const amp = context.createGain();
  applySteps(parts.pitch, frequencySteps(voice, at));
  applySteps(amp.gain, envelopeSteps(voice, at));
  parts.output.connect(amp);
  amp.connect(destination);
  parts.source.start(at);
  parts.source.stop(at + voice.duration + 0.05);
  return parts.source;
}
