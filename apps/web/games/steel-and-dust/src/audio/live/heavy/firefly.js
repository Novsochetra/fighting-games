import { blip, hiss } from '../layers.js';
import { biquad, envelopeGain, oscillator } from '../nodes.js';

// the swarm's own twinkle (signature-sounds.js `swarm`) climbs higher here, as the swarm gathers
const TWINKLE = [2637, 3136, 3520, 4186];

// beating wings: two saws a little apart beat against each other, a flutter that quickens as the
// swarm swells and its buzz climbs
function wingBuzz(live, start, { duration, volume }) {
  const envelope = envelopeGain(live, {
    destination: live.chain.effectsBus,
    start,
    attack: duration * 0.65,
    peak: volume,
    decay: duration * 0.45,
  });
  const band = { type: 'bandpass', from: 900, to: 2200, resonance: 2, start, duration };
  const filter = biquad(live, { ...band, destination: envelope });
  oscillator(live, { wave: 'sawtooth', from: 170, to: 260, start, duration, destination: filter });
  oscillator(live, { wave: 'sawtooth', from: 199, to: 300, start, duration, destination: filter });
}

function twinkle(live, start, { gap, volume }) {
  TWINKLE.forEach((frequency, i) => {
    blip(live, { start: start + i * gap, frequency, duration: 0.06, volume, wave: 'sine' });
  });
}

function heavyFireflyCharge(live, start) {
  wingBuzz(live, start, { duration: 0.17, volume: 0.07 });
  twinkle(live, start + 0.04, { gap: 0.032, volume: 0.032 });
  const shimmer = { type: 'highpass', from: 5500, to: 8000, resonance: 0.8 };
  hiss(live, { start, ...shimmer, attack: 0.12, duration: 0.07, volume: 0.022 });
}

// the swarm's flash, kept under the swing and hit that play with it: one high glint and a breath
function heavyFireflyRelease(live, start) {
  blip(live, { start, frequency: 4699, duration: 0.07, volume: 0.022, wave: 'sine' });
  const sparkle = { type: 'highpass', from: 6000, to: 9000, resonance: 0.7 };
  hiss(live, { start, ...sparkle, attack: 0.004, duration: 0.08, volume: 0.025 });
}

export const FIREFLY_HEAVY_SOUNDS = { heavyFireflyCharge, heavyFireflyRelease };
