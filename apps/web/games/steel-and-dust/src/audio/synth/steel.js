import { expCurve } from './curves.js';
import { strikeEnvelope } from './envelopes.js';
import { signal } from './signal.js';
import { fmSource } from './sources.js';
import { excitation, modes } from './struck.js';

const BLADE_STRIKE = { milliseconds: 1.5, lowpass: 10000, click: 1 };

// struck steel: modes [ratio to base, share of the decay, level], each with a slightly detuned twin,
// because two modes a few hertz apart beat, and that shimmer is what makes a ring sound like a real
// blade instead of a pure electronic tone
export function steel(track, { start = 0, base, ratios, decay, level, beat = 0.004 }) {
  const strike = excitation(BLADE_STRIKE, track.sampleRate);
  const list = ratios.flatMap(([ratio, decayShare, gain], i) => {
    const frequency = base * ratio;
    const seconds = decay * decayShare;
    const twin = frequency * (1 + beat * (i % 2 ? 1 : -0.7));
    return [
      [frequency, seconds, level * gain * 0.6],
      [twin, seconds * 0.9, level * gain * 0.45],
    ];
  });
  modes(track, strike, list, start);
}

// a blade's bright "shiing": an FM clang whose brightness fades with it
export function shing(track, { start = 0, carrier, ratio = 1.414, index, decay, level }) {
  const attack = 0.001;
  signal(track, {
    source: fmSource({ carrier, ratio, index: index || expCurve([0, 3.5, decay * 0.6, 0.3]) }),
    envelope: strikeEnvelope(attack, decay),
    length: attack + decay,
    level,
    start,
  });
}
