import { blip, click, crunch, hiss, metal, thump } from './layers.js';
import { envelopeGain, oscillator } from './nodes.js';

// a gold letter slammed onto a title card: a short dropping body, its grit and a clink of metal
function stamp(live, start) {
  thump(live, { start, from: 190, to: 60, duration: 0.11, volume: 0.32 });
  crunch(live, { start, duration: 0.05, volume: 0.1, frequency: 1300 });
  click(live, { start, volume: 0.12, frequency: 2400 });
  metal(live, { start, frequencies: [2093, 3170], duration: 0.12, volume: 0.02 });
}

// night rushing over the cleared road, rising as the wipe closes, and a dull boom as it shuts
function wipe(live, start) {
  const rush = { type: 'bandpass', from: 350, to: 3800, resonance: 1.8 };
  hiss(live, { start, ...rush, attack: 0.5, duration: 0.3, volume: 0.16 });
  const destination = live.chain.effectsBus;
  const envelope = envelopeGain(live, { destination, start, attack: 0.5, peak: 0.03, decay: 0.25 });
  oscillator(live, {
    wave: 'triangle',
    from: 220,
    to: 880,
    start,
    duration: 0.75,
    destination: envelope,
  });
  thump(live, { start: start + 0.72, from: 110, to: 38, duration: 0.5, volume: 0.45 });
}

// the next road opening out of the night: the rush falling away and a soft bell over it
function reveal(live, start) {
  const fall = { type: 'bandpass', from: 3600, to: 300, resonance: 1.6 };
  hiss(live, { start, ...fall, attack: 0.04, duration: 0.6, volume: 0.15 });
  blip(live, { start: start + 0.05, frequency: 1568, duration: 0.5, volume: 0.05, wave: 'sine' });
  blip(live, { start: start + 0.12, frequency: 2349, duration: 0.4, volume: 0.025, wave: 'sine' });
}

export const HANDOFF_SOUNDS = { stamp, wipe, reveal };
