export function normalize(samples) {
  let loudest = 0;
  for (let i = 0; i < samples.length; i++) {
    loudest = Math.max(loudest, Math.abs(samples[i]));
  }
  if (loudest > 0) {
    for (let i = 0; i < samples.length; i++) {
      samples[i] /= loudest;
    }
  }
}

function driveAndCutRumble(samples, drive, cutoff, sampleRate) {
  const coefficient = Math.exp((-2 * Math.PI * cutoff) / sampleRate);
  let previous = 0;
  let highpassed = 0;
  for (let i = 0; i < samples.length; i++) {
    const x = drive ? Math.tanh(samples[i] * drive) : samples[i];
    highpassed = coefficient * (highpassed + x - previous);
    previous = x;
    samples[i] = highpassed;
  }
}

// like an old arcade sample
function topCut(samples, cutoff, sampleRate) {
  const smoothing = 1 - Math.exp((-2 * Math.PI * cutoff) / sampleRate);
  let first = 0;
  let second = 0;
  for (let i = 0; i < samples.length; i++) {
    first += (samples[i] - first) * smoothing;
    second += (first - second) * smoothing;
    samples[i] = second;
  }
}

function bitCrush(samples, { rate, bits }, sampleRate) {
  const hold = Math.max(1, Math.round(sampleRate / rate));
  const steps = Math.pow(2, bits - 1);
  let held = 0;
  for (let i = 0; i < samples.length; i++) {
    if (i % hold === 0) {
      held = Math.round(samples[i] * steps) / steps;
    }
    samples[i] = held;
  }
}

function fadeTail(samples, sampleRate) {
  const fade = Math.min(samples.length, Math.round(sampleRate * 0.006));
  for (let i = 0; i < fade; i++) {
    samples[samples.length - 1 - i] *= i / fade;
  }
}

// glue the layers: normalize, drive (denser and louder on phone speakers), cut the rumble, optional
// top cut and lo-fi crush, fade the tail. shape: { drive, crush: { rate, bits }, lowpass }
export function finish(track, shape = {}) {
  const { samples, sampleRate } = track;
  normalize(samples);
  driveAndCutRumble(samples, shape.drive, shape.crush ? 150 : 30, sampleRate);
  if (shape.lowpass) {
    topCut(samples, shape.lowpass, sampleRate);
  }
  if (shape.crush) {
    bitCrush(samples, shape.crush, sampleRate);
  }
  fadeTail(samples, sampleRate);
  normalize(samples);
}
