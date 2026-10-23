import { blip, crunch, hiss, metal, thump } from './layers.js';
import { biquad, envelopeGain, oscillator } from './nodes.js';

const CLEAR_NOTES = [523, 659, 784, 1047];
const CLEAR_CHORD = [
  { frequency: 1047, volume: 0.15 },
  { frequency: 1319, volume: 0.08 },
  { frequency: 1568, volume: 0.06 },
];

function clear(live, start) {
  CLEAR_NOTES.forEach((frequency, i) => {
    const at = start + i * 0.12;
    blip(live, { start: at, frequency, duration: 0.16, volume: 0.14 });
    blip(live, { start: at, frequency: frequency * 2, duration: 0.12, volume: 0.03, wave: 'sine' });
  });
  for (const note of CLEAR_CHORD) {
    blip(live, { start: start + 0.5, duration: 0.6, ...note });
  }
}

function chargeLevel1(live, start) {
  const destination = live.chain.effectsBus;
  const envelope = envelopeGain(live, { destination, start, attack: 0.01, peak: 0.1, decay: 0.17 });
  const lowpass = biquad(live, {
    type: 'lowpass',
    from: 3000,
    to: 3000,
    resonance: 0.7,
    start,
    duration: 0.2,
    destination: envelope,
  });
  oscillator(live, {
    wave: 'triangle',
    from: 330,
    to: 990,
    start,
    duration: 0.18,
    destination: lowpass,
  });
  hiss(live, {
    start,
    type: 'bandpass',
    from: 700,
    to: 3200,
    resonance: 1.5,
    attack: 0.05,
    duration: 0.1,
    volume: 0.07,
  });
}

function chargeMax(live, start) {
  [990, 1320, 1760].forEach((frequency, i) =>
    blip(live, { start: start + i * 0.05, frequency, duration: 0.3, volume: 0.08 }),
  );
  hiss(live, {
    start,
    type: 'highpass',
    from: 6000,
    to: 8000,
    resonance: 0.7,
    attack: 0.01,
    duration: 0.15,
    volume: 0.05,
  });
}

// a detuned saw chord opening up under a falling thump
function ult(live, start) {
  const destination = live.chain.effectsBus;
  const swell = envelopeGain(live, {
    destination,
    start,
    attack: 0.25,
    peak: 0.06,
    decay: 0.5,
    hold: 0.15,
  });
  const lowpass = biquad(live, {
    type: 'lowpass',
    from: 400,
    to: 4200,
    resonance: 1.2,
    start,
    duration: 0.45,
    destination: swell,
  });
  for (const frequency of [392, 523, 659, 784]) {
    oscillator(live, {
      wave: 'sawtooth',
      from: frequency,
      start,
      duration: 0.95,
      destination: lowpass,
    });
    const detuned = frequency * 1.006;
    oscillator(live, {
      wave: 'sawtooth',
      from: detuned,
      start,
      duration: 0.95,
      destination: lowpass,
    });
  }
  thump(live, { start, from: 70, to: 34, duration: 0.7, volume: 0.8 });
  const rise = { type: 'bandpass', from: 300, to: 5000, resonance: 1.3 };
  hiss(live, { start, ...rise, attack: 0.3, duration: 0.5, volume: 0.14 });
}

function ultEnd(live, start) {
  thump(live, { start, from: 100, to: 28, duration: 0.8, volume: 1.0 });
  crunch(live, { start, duration: 0.3, volume: 0.4, frequency: 600 });
  const fall = { type: 'lowpass', from: 3000, to: 60, resonance: 0.7 };
  hiss(live, { start, ...fall, attack: 0.003, duration: 0.7, volume: 0.45 });
  metal(live, { start, frequencies: [1600, 2400, 3600], duration: 0.6, volume: 0.05 });
}

export const EVENT_SOUNDS = { clear, chargeLevel1, chargeMax, ult, ultEnd };
