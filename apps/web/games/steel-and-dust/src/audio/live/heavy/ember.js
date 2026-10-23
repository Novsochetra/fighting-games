import { click, hiss, thump } from '../layers.js';
import { biquad, envelopeGain, oscillator } from '../nodes.js';

// when each crackle of the fire snaps, in seconds from the start, and how bright it is (Hz);
// uneven on purpose, as a fire's are
const CRACKLES = [
  [0.016, 3800],
  [0.044, 2600],
  [0.067, 4700],
  [0.091, 3100],
  [0.118, 5300],
  [0.137, 2900],
  [0.161, 4200],
];

// a low roar building under the fire: a rough tone and its fifth rising through an opening filter
function roar(live, start, { duration, volume }) {
  const envelope = envelopeGain(live, {
    destination: live.chain.effectsBus,
    start,
    attack: duration * 0.8,
    peak: volume,
    decay: duration * 0.3,
  });
  const lowpass = biquad(live, {
    type: 'lowpass',
    from: 240,
    to: 1500,
    resonance: 1.4,
    start,
    duration,
    destination: envelope,
  });
  oscillator(live, { wave: 'sawtooth', from: 72, to: 150, start, duration, destination: lowpass });
  oscillator(live, { wave: 'triangle', from: 108, to: 225, start, duration, destination: lowpass });
}

// phoenix fire drawn in to the fist: a breath of flame sucked inward that swells to the strike,
// crackling, over a roar that builds with it
function heavyEmberCharge(live, start) {
  const inhale = { type: 'bandpass', from: 360, to: 2600, resonance: 1.3 };
  hiss(live, { start, ...inhale, attack: 0.15, duration: 0.06, volume: 0.075 });
  roar(live, start, { duration: 0.17, volume: 0.05 });
  CRACKLES.forEach(([at, frequency], i) => {
    click(live, { start: start + at, volume: 0.028 + (i % 3) * 0.008, frequency });
  });
}

// the gathered fire let go: a soft gust of flame and a low whump under the swing
function heavyEmberRelease(live, start) {
  const gust = { type: 'bandpass', from: 1700, to: 480, resonance: 1.1 };
  hiss(live, { start, ...gust, attack: 0.006, duration: 0.14, volume: 0.035 });
  thump(live, { start, from: 130, to: 62, duration: 0.1, volume: 0.05 });
}

export const EMBER_HEAVY_SOUNDS = { heavyEmberCharge, heavyEmberRelease };
