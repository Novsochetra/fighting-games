import { click, hiss, thump } from '../layers.js';
import { biquad, envelopeGain, oscillator } from '../nodes.js';

// power gathering for a heavy: a tone that sweeps up through an opening filter over a rising rush
export function chargeSweep(live, start, { from, to, duration = 0.2, volume = 0.08 }) {
  const destination = live.chain.effectsBus;
  const envelope = envelopeGain(live, {
    destination,
    start,
    attack: 0.03,
    peak: volume,
    decay: duration,
  });
  const lowpass = biquad(live, {
    type: 'lowpass',
    from: 900,
    to: 4200,
    resonance: 2,
    start,
    duration,
    destination: envelope,
  });
  oscillator(live, { wave: 'sawtooth', from, to, start, duration, destination: lowpass });
  oscillator(live, {
    wave: 'triangle',
    from: from / 2,
    to: to / 2,
    start,
    duration,
    destination: lowpass,
  });
  const rush = { type: 'bandpass', from: 500, to: 3600, resonance: 1.4 };
  hiss(live, {
    start,
    ...rush,
    attack: duration * 0.7,
    duration: duration * 0.4,
    volume: volume * 0.8,
  });
}

// heavy pressed with too little bar: a dull click and a short downward buzz that dies at once
export function heavyEmpty(live, start) {
  click(live, { start, volume: 0.06, frequency: 900 });
  thump(live, { start, from: 220, to: 110, duration: 0.12, volume: 0.12 });
  const fizz = { type: 'bandpass', from: 1400, to: 500, resonance: 3 };
  hiss(live, { start, ...fizz, attack: 0.005, duration: 0.12, volume: 0.04 });
}
