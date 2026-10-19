import { expCurve, linearCurve } from './curves.js';
import { layer } from './layer.js';

function sweep(spec, ratio) {
  return expCurve([
    0,
    spec.cutoffFrom * ratio,
    spec.peak,
    spec.cutoffPeak * ratio,
    spec.length,
    spec.cutoffTo * ratio,
  ]);
}

// air pushed past the ear: a band of noise whose pitch and level rise to a peak, then fall
export function whoosh(track, spec) {
  const { length, peak, cutoffFrom, cutoffPeak, cutoffTo, resonance } = spec;
  const fall = peak + (length - peak) * 0.3;
  layer(track, {
    filter: 'bandpass',
    resonance,
    cutoff: expCurve([0, cutoffFrom, peak, cutoffPeak, length, cutoffTo]),
    envelope: linearCurve([0, 0, peak * 0.6, 0.35, peak, 1, fall, 0.45, length, 0]),
    length,
    start: spec.start,
    // scaled so narrow and wide bands come out about equally loud
    level:
      (spec.level * 0.3) / (0.577 * Math.sqrt(cutoffPeak / resonance / (track.sampleRate / 2))),
  });
}

function bandLevel(frequency, resonance, sampleRate) {
  return 0.3 / (0.577 * Math.sqrt(frequency / resonance / (sampleRate / 2)));
}

// a swing: broadband air plus a thin whistle (a fast blade or limb sings), swelling to a peak at the
// moment of contact, then cut off fast
export function swoosh(track, spec) {
  const { length, peak, cutoffPeak, resonance, whistle, level } = spec;
  const fall = peak + (length - peak) * 0.25;
  const envelope = linearCurve([
    0,
    0,
    peak * 0.5,
    0.2,
    peak * 0.85,
    0.7,
    peak,
    1,
    fall,
    0.35,
    length,
    0,
  ]);
  layer(track, {
    filter: 'bandpass',
    resonance,
    cutoff: sweep(spec, 1),
    envelope,
    length,
    level: level * bandLevel(cutoffPeak, resonance, track.sampleRate),
  });
  if (whistle) {
    layer(track, {
      filter: 'bandpass',
      resonance: whistle.resonance,
      cutoff: sweep(spec, whistle.ratio),
      envelope,
      length,
      level:
        level *
        whistle.level *
        bandLevel(cutoffPeak * whistle.ratio, whistle.resonance, track.sampleRate),
    });
  }
}
