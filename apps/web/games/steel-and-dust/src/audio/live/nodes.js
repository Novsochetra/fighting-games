// live building blocks; `live` is { context, chain } and every start is an absolute context time

export function envelopeGain(live, { destination, start, attack, peak, decay, hold }) {
  const node = live.context.createGain();
  node.gain.setValueAtTime(0.0001, start);
  node.gain.linearRampToValueAtTime(peak, start + attack);
  if (hold) {
    node.gain.setValueAtTime(peak, start + attack + hold);
  }
  node.gain.exponentialRampToValueAtTime(0.0001, start + attack + (hold || 0) + decay);
  node.connect(destination);
  return node;
}

export function oscillator(live, { wave, from, to = from, start, duration, destination, glide }) {
  const node = live.context.createOscillator();
  node.type = wave;
  node.frequency.setValueAtTime(from, start);
  if (to !== from) {
    node.frequency.exponentialRampToValueAtTime(Math.max(20, to), start + (glide || duration));
  }
  node.connect(destination);
  node.start(start);
  node.stop(start + duration + 0.05);
  return node;
}

export function biquad(live, { type, from, to, resonance, start, duration, destination }) {
  const node = live.context.createBiquadFilter();
  node.type = type;
  node.frequency.setValueAtTime(from, start);
  if (to && to !== from) {
    node.frequency.exponentialRampToValueAtTime(Math.max(30, to), start + duration);
  }
  node.Q.value = resonance || 0.7;
  node.connect(destination);
  return node;
}

export function noise(live, { start, duration, destination, rate }) {
  const node = live.context.createBufferSource();
  node.buffer = live.chain.noiseBuffer;
  node.playbackRate.value = rate || 1;
  node.connect(destination);
  node.start(start, Math.random() * 0.8);
  node.stop(start + duration + 0.05);
  return node;
}
