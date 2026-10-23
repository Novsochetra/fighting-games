// a compressor over the whole track: everything louder than `threshold` (a share of the peak) is
// pulled down toward it, so a roar stays dense and loud instead of spiky; quieter tails are untouched
export function squash(track, { threshold, ratio, attack, release }) {
  const { samples, sampleRate } = track;
  let peak = 0;
  for (const value of samples) {
    peak = Math.max(peak, Math.abs(value));
  }
  const limit = threshold * peak;
  const rise = 1 - Math.exp(-1 / (attack * sampleRate));
  const fall = 1 - Math.exp(-1 / (release * sampleRate));
  let envelope = 0;
  for (let i = 0; i < samples.length; i++) {
    const level = Math.abs(samples[i]);
    envelope += (level - envelope) * (level > envelope ? rise : fall);
    if (envelope > limit) {
      samples[i] *= Math.pow(limit / envelope, 1 - 1 / ratio);
    }
  }
}
