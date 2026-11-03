import { midiToFrequency } from '../music/notes.js';
import { envelope, gain, tone, wobble } from '../nodes.js';
import { SPECIAL_LOOKS } from './looks.js';
import { hiss, stab, thud } from './parts.js';

const OPEN_FIFTHS = [50, 57, 62, 69].map(midiToFrequency);

// the hit that opens a cut-in: a deep boom, a stab of open fifths and a crash
function duel(voice, { start }) {
  thud(voice, { start, from: 110, to: 32, peak: 0.6, decay: 0.7 });
  stab(voice, { start, frequencies: OPEN_FIFTHS, peak: 0.1, decay: 0.9 });
  hiss(voice, { start, type: 'highpass', from: 5000, to: 3000, peak: 0.16, decay: 1.1 });
}

function duelEnd(voice, { start }) {
  hiss(voice, { start, from: 2600, to: 500, resonance: 1.2, peak: 0.24, attack: 0.05, decay: 0.3 });
  thud(voice, { start: start + 0.05, from: 140, to: 60, peak: 0.25, decay: 0.1 });
}

// spirit gathering: two voices a hair apart climb an octave, trembling, with air rising round them
function charge(voice, { start, look = 'plain' }) {
  const base = (SPECIAL_LOOKS[look] ?? SPECIAL_LOOKS.plain).shimmer;
  const duration = 1.6;
  const body = envelope(voice, {
    destination: voice.output,
    start,
    attack: 0.9,
    peak: 0.11,
    hold: 0.2,
    decay: 0.45,
  });
  const tremble = gain(voice, { destination: body, value: 0.7 });

  wobble(voice, { param: tremble.gain, rate: 13, depth: 0.3, start, duration });

  for (const spread of [1, 1.006]) {
    tone(voice, {
      wave: 'triangle',
      from: base * spread,
      to: base * 2 * spread,
      start,
      duration,
      glide: 1.2,
      destination: tremble,
    });
  }

  hiss(voice, {
    start,
    type: 'highpass',
    from: 1800,
    to: 7000,
    peak: 0.05,
    attack: 0.9,
    hold: 0.1,
    decay: 0.5,
  });
}

export const DUEL_CUES = { duel, duelEnd, charge };
