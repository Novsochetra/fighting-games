// a hit: a fast rise, then an exponential fall to silence over `decay`
export function strikeEnvelope(attack, decay) {
  return (time) => (time < attack ? time / attack : Math.exp((-6.9 * (time - attack)) / decay));
}

function pulseAt(time, [start, attack, hold, decay, level = 1]) {
  const elapsed = time - start;
  if (elapsed < 0) {
    return 0;
  }
  if (elapsed < attack) {
    return (elapsed / attack) * level;
  }
  const falling = Math.max(0, elapsed - attack - hold);
  return Math.exp((-6.9 * falling) / decay) * level;
}

// gated bursts, each [start, attack, hold, decay, level]: a stutter ("jib, jib, jib")
export function pulses(list) {
  return (time) => list.reduce((loudest, pulse) => Math.max(loudest, pulseAt(time, pulse)), 0);
}
