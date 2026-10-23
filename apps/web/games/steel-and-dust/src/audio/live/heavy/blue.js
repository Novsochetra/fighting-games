import { click, hiss, metal } from '../layers.js';
import { envelopeGain, oscillator } from '../nodes.js';

// ice crackling as it forms: bright ticks, scattered and fading
const CRACKLE = [
  [0, 5200, 0.06],
  [0.026, 3600, 0.05],
  [0.058, 6400, 0.045],
  [0.092, 4400, 0.035],
  [0.124, 5800, 0.025],
];
// the blade's ring as it clears the sheath: an open fifth, high and cold, as glassy as the freeze
const RING = [2093, 3136, 4699];

// a cold pure tone rising an octave as the power gathers
function rise(live, { start, from, duration, volume }) {
  const destination = live.chain.effectsBus;
  const envelope = envelopeGain(live, {
    destination,
    start,
    attack: 0.04,
    peak: volume,
    decay: duration,
  });
  oscillator(live, {
    wave: 'triangle',
    from,
    to: from * 2,
    start,
    duration,
    destination: envelope,
  });
}

// a blade drawn from its sheath: a ringing scrape rising into a glassy ring, over crackling ice
function heavyBlueCharge(live, start) {
  const scrape = { type: 'bandpass', from: 1800, to: 6800, resonance: 4 };
  hiss(live, { start, ...scrape, attack: 0.06, duration: 0.1, volume: 0.12 });
  rise(live, { start, from: 880, duration: 0.14, volume: 0.035 });
  for (const [offset, frequency, volume] of CRACKLE) {
    click(live, { start: start + offset, volume, frequency });
  }
  metal(live, { start: start + 0.07, frequencies: RING, duration: 0.18, volume: 0.05 });
}

// the cold flash of the draw: one faint high ping of glass under the swing
function heavyBlueRelease(live, start) {
  metal(live, { start, frequencies: [4186, 6645], duration: 0.1, volume: 0.022 });
}

export const BLUE_HEAVY_SOUNDS = { heavyBlueCharge, heavyBlueRelease };
