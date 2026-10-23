import { asCurve } from './curves.js';
import { phasor } from './signal.js';

const TAU = Math.PI * 2;

// FM: a non-integer ratio gives the inharmonic clang of struck metal; index is how bright, over time
export const fmSource =
  ({ carrier, ratio, index }) =>
  (sampleRate) => {
    const carrierAt = asCurve(carrier);
    const indexAt = asCurve(index);
    const carrierPhase = phasor(carrierAt, sampleRate);
    const modulatorPhase = phasor((time) => carrierAt(time) * ratio, sampleRate);
    return (time) => {
      const modulation = Math.sin(TAU * modulatorPhase(time)) * indexAt(time);
      return Math.sin(TAU * carrierPhase(time) + modulation);
    };
  };

// a square wave times a sine: nothing harmonic is left, so it buzzes harsh and eerie
export const ringModSource =
  ({ carrier, modulator }) =>
  (sampleRate) => {
    const carrierPhase = phasor(carrier, sampleRate);
    const modulatorPhase = phasor(modulator, sampleRate);
    return (time) => (carrierPhase(time) < 0.5 ? 1 : -1) * Math.sin(TAU * modulatorPhase(time));
  };

// each frequency as two saws a little apart, so the stack beats and growls
export const sawStackSource =
  ({ frequencies, detune }) =>
  (sampleRate) => {
    const phases = frequencies.flatMap((frequency) => [
      phasor(frequency, sampleRate),
      phasor(frequency * (1 + detune), sampleRate),
    ]);
    const scale = 1 / Math.sqrt(phases.length);
    return (time) => phases.reduce((sum, phase) => sum + 2 * phase(time) - 1, 0) * scale;
  };
