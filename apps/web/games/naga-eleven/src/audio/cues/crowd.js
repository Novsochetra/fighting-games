import { hiss } from './parts.js';

// a crowd's vowel is a band of its murmur: "ooh" rises through it, "aww" falls; `level` is the
// crowd's size, 0 to 1
function ooh(voice, { start, level = 1 }) {
  const buffer = voice.chain.murmur;

  hiss(voice, {
    start,
    buffer,
    from: 320,
    to: 760,
    resonance: 2.4,
    sweep: 0.6,
    peak: 0.9 * level,
    attack: 0.3,
    hold: 0.25,
    decay: 1.1,
  });
}

// the roar swells, holds while the ball sits in the net, and fades as the players walk back
function roar(voice, { start, level = 1 }) {
  const buffer = voice.chain.murmur;

  hiss(voice, {
    start,
    buffer,
    from: 500,
    to: 900,
    resonance: 0.7,
    sweep: 0.5,
    peak: 1.5 * level,
    attack: 0.35,
    hold: 1.6,
    decay: 2.8,
  });
  hiss(voice, {
    start: start + 0.1,
    buffer,
    from: 1500,
    to: 2400,
    resonance: 1,
    sweep: 0.6,
    peak: 0.8 * level,
    attack: 0.5,
    hold: 1.2,
    decay: 2.2,
  });
}

function groan(voice, { start, level = 1 }) {
  const buffer = voice.chain.murmur;

  hiss(voice, {
    start,
    buffer,
    from: 650,
    to: 260,
    resonance: 2,
    peak: 1.1 * level,
    attack: 0.18,
    hold: 0.3,
    decay: 1.4,
  });
}

export const CROWD_CUES = { ooh, roar, groan };
