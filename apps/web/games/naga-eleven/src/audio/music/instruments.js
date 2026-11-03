import { INSTRUMENTS } from '../../data/music/band.js';
import { hiss, ring, thud } from '../cues/parts.js';
import { envelope, gain, strikes, tone, wobble } from '../nodes.js';
import { midiToFrequency } from './notes.js';

// each plays one note `{ midi | hit, time, duration, octave, roll }` into the voice's output

function rollTimes(note, gap) {
  const count = Math.max(2, Math.floor(note.duration / gap));

  return Array.from({ length: count }, (_, i) => note.time + i * gap);
}

// struck bars ring short; a roll strikes the same bar again and again, an octave adds the bar above
function roneat(voice, note) {
  const { level, decay, rollGap } = INSTRUMENTS.roneat;
  const frequency = midiToFrequency(note.midi);
  const times = note.roll ? rollTimes(note, rollGap) : [note.time];
  const duration = times.at(-1) + decay - note.time + 0.05;
  const struck = strikes(voice, { destination: voice.output, times, peak: level, decay });
  const start = note.time;

  tone(voice, { wave: 'triangle', from: frequency, start, duration, destination: struck });

  if (note.octave) {
    const upper = gain(voice, { destination: struck, value: 0.5 });

    tone(voice, { wave: 'triangle', from: frequency * 2, start, duration, destination: upper });
  }
}

function kong(voice, note) {
  const { level, decay } = INSTRUMENTS.kong;
  const frequency = midiToFrequency(note.midi);

  ring(voice, { start: note.time, frequency, ratios: [1, 1.003, 2], peak: level, decay });
}

// a bowed string: it swells in, and its vibrato only starts once the note has settled
function tro(voice, note) {
  const { level, vibrato } = INSTRUMENTS.tro;
  const frequency = midiToFrequency(note.midi);
  const start = note.time;
  const duration = note.duration + 0.25;
  const hold = Math.max(0, note.duration - 0.1);
  const body = envelope(voice, {
    destination: voice.output,
    start,
    attack: 0.08,
    peak: level,
    hold,
    decay: 0.18,
  });
  const bow = tone(voice, {
    wave: 'sawtooth',
    from: frequency,
    start,
    duration,
    destination: body,
  });

  wobble(voice, {
    param: bow.frequency,
    rate: vibrato,
    depth: frequency * 0.012,
    start,
    duration,
    delay: 0.25,
  });
}

function bass(voice, note) {
  const { level } = INSTRUMENTS.bass;
  const start = note.time;
  const hold = note.duration * 0.6;
  const body = envelope(voice, {
    destination: voice.output,
    start,
    attack: 0.005,
    peak: level,
    hold,
    decay: 0.12,
  });

  tone(voice, {
    wave: 'triangle',
    from: midiToFrequency(note.midi),
    start,
    duration: hold + 0.2,
    destination: body,
  });
}

function skor(voice, note) {
  const { level } = INSTRUMENTS.skor;
  const start = note.time;

  if (note.hit === 'S') {
    hiss(voice, { start, from: 1700, resonance: 1.3, peak: level * 0.55, decay: 0.07 });
    thud(voice, { start, wave: 'triangle', from: 280, to: 210, peak: level * 0.3, decay: 0.05 });

    return;
  }

  thud(voice, {
    start,
    from: 120,
    to: 52,
    peak: note.hit === 't' ? level * 0.5 : level,
    decay: 0.22,
  });
}

function chhing(voice, note) {
  const { level } = INSTRUMENTS.chhing;
  const open = note.hit === 'o';

  hiss(voice, {
    start: note.time,
    type: 'highpass',
    from: 6500,
    peak: level,
    decay: open ? 0.22 : 0.035,
  });

  if (open) {
    ring(voice, {
      start: note.time,
      frequency: 3800,
      ratios: [1, 1.47, 2.09],
      peak: level * 0.4,
      decay: 0.35,
    });
  }
}

export const PLAYERS = { roneat, kong, tro, bass, skor, chhing };
