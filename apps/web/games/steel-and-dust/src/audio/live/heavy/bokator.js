import { hiss, metal, thump } from '../layers.js';
import { biquad, envelopeGain, oscillator } from '../nodes.js';

// a lion's growl rising in the chest: a rough low buzz through a lowpass that opens as it swells
function growl(live, start, { from, to, duration, volume }) {
  const envelope = envelopeGain(live, {
    destination: live.chain.effectsBus,
    start,
    attack: duration * 0.6,
    peak: volume,
    decay: duration * 0.45,
  });
  const lowpass = biquad(live, {
    type: 'lowpass',
    from: 360,
    to: 1100,
    resonance: 3,
    start,
    duration,
    destination: envelope,
  });
  oscillator(live, { wave: 'sawtooth', from, to, start, duration, destination: lowpass });
  // a second voice a hair out of tune beats against the first: the rasp of a throat
  const rasp = { wave: 'square', from: from * 1.03, to: to * 1.02 };
  oscillator(live, { ...rasp, start, duration, destination: lowpass });
}

// Bokator gathers a heavy: the skor drum beat of a planted foot, the breath he draws in catching
// the gold flame behind him with a rising whoosh, and a lion's growl swelling under it to the blow
function heavyBokatorCharge(live, start) {
  thump(live, { start, from: 130, to: 58, duration: 0.12, volume: 0.13 });
  const whoosh = { type: 'bandpass', from: 700, to: 2600, resonance: 0.9 };
  hiss(live, { start: start + 0.02, ...whoosh, attack: 0.08, duration: 0.07, volume: 0.07 });
  growl(live, start + 0.03, { from: 74, to: 104, duration: 0.17, volume: 0.05 });
}

// the blow let go: the faint ring of temple gold under the swing, as his echoes chime (echo)
function heavyBokatorRelease(live, start) {
  metal(live, { start, frequencies: [1568, 2352, 3136], duration: 0.16, volume: 0.02 });
}

export const BOKATOR_HEAVY_SOUNDS = { heavyBokatorCharge, heavyBokatorRelease };
