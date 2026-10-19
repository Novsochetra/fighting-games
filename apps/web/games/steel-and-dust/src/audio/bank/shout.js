import { expCurve, linearCurve } from '../synth/curves.js';
import { layer } from '../synth/layer.js';
import { voice } from '../synth/voice.js';

const curveOrValue = (value) => (Array.isArray(value) ? linearCurve(value) : value);

// a shout: pitch, envelope and vowels are curves over time; breath, rough, openQuotient and sub can be
// a number or a curve. burst puts a "g" before the voice, tail a "gh" breath after it
export function shout(spec) {
  const shouted = {
    ...spec,
    pitch: expCurve(spec.pitch),
    envelope: linearCurve(spec.envelope),
    breath: curveOrValue(spec.breath),
    rough: curveOrValue(spec.rough),
  };
  for (const key of ['openQuotient', 'sub']) {
    if (shouted[key] !== undefined) {
      shouted[key] = curveOrValue(shouted[key]);
    }
  }
  return shouted;
}

// voices are a little lo-fi, like old arcade samples
export function shoutBuilder(shouts, drive) {
  return (track, pitch, take) => {
    const chosen = shouts[take % shouts.length];
    if (chosen.burst) {
      layer(track, {
        filter: 'bandpass',
        resonance: 1,
        cutoff: 1700,
        attack: 0.001,
        decay: 0.014,
        level: 2.5,
      });
    }
    voice(track, { ...chosen, pitchScale: pitch });
    if (chosen.tail) {
      const start = (chosen.start || 0) + chosen.length - 0.05;
      layer(track, {
        filter: 'bandpass',
        resonance: 1.4,
        cutoff: 1500,
        attack: 0.02,
        decay: 0.09,
        level: 1.6,
        start,
      });
    }
    return { drive, crush: { rate: 18500, bits: 12 }, lowpass: 7500 };
  };
}
