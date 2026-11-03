import { midiToFrequency } from '../music/notes.js';
import { envelope, filter, tone } from '../nodes.js';
import { ring, run } from './parts.js';

const notes = (...midis) => midis.map(midiToFrequency);

// the same note struck over and over: a roneat roll
const rolled = (midi, count) => Array.from({ length: count }, () => midiToFrequency(midi));

function cursor(voice, { start }) {
  const body = envelope(voice, {
    destination: voice.output,
    start,
    attack: 0.002,
    peak: 0.12,
    decay: 0.03,
  });
  const soft = filter(voice, { from: 3000, start, duration: 0.06, destination: body });

  tone(voice, { wave: 'square', from: 1320, start, duration: 0.05, destination: soft });
}

function confirm(voice, { start }) {
  run(voice, { start, frequencies: notes(81, 88), gap: 0.07, peak: 0.16, decay: 0.2 });
}

function back(voice, { start }) {
  run(voice, { start, frequencies: notes(88, 81), gap: 0.06, peak: 0.11, decay: 0.16 });
}

// up the pentatonic to a rolled high D over a gong
function levelUp(voice, { start }) {
  const climb = notes(74, 76, 78, 81, 83);
  const top = start + climb.length * 0.07;

  run(voice, { start, frequencies: climb, gap: 0.07, peak: 0.15, decay: 0.12 });
  run(voice, { start: top, frequencies: rolled(86, 10), gap: 0.04, peak: 0.13, decay: 0.5 });
  ring(voice, { start: top, frequency: 73.4, ratios: [1, 1.004, 2.76], peak: 0.2, decay: 2 });
}

// a new move: a deep gong, then a rolled chord climbing out of it
function moveUnlocked(voice, { start }) {
  ring(voice, { start, frequency: 55, ratios: [1, 1.004, 2.76, 5.4], peak: 0.3, decay: 3 });
  run(voice, {
    start: start + 0.25,
    frequencies: notes(69, 76, 81, 88, 93),
    gap: 0.09,
    peak: 0.13,
    decay: 0.6,
  });
  run(voice, { start: start + 0.7, frequencies: rolled(93, 12), gap: 0.04, peak: 0.1, decay: 0.6 });
}

export const UI_CUES = { cursor, confirm, back, levelUp, moveUnlocked };
