import { hiss, thud } from './parts.js';

// the ball into the gloves: a muffled thump of leather; a parry adds the slap of it pushed away
function save(voice, { start, parried = false }) {
  thud(voice, { start, from: 120, to: 55, peak: 0.45, decay: 0.12 });
  hiss(voice, { start, type: 'lowpass', from: 1100, to: 500, peak: 0.3, decay: 0.08 });

  if (parried) {
    hiss(voice, { start: start + 0.01, type: 'highpass', from: 2500, peak: 0.18, decay: 0.05 });
  }
}

// a body's thud and studs scuffing the grass; a tackle that wins it pokes the ball away
function tackle(voice, { start, won = true }) {
  thud(voice, { start, from: 95, to: 42, peak: 0.42, decay: 0.14 });
  hiss(voice, {
    start: start + 0.015,
    from: 3200,
    to: 1100,
    resonance: 0.9,
    peak: 0.22,
    attack: 0.01,
    decay: 0.2,
  });

  if (won) {
    thud(voice, { start: start + 0.06, from: 220, to: 120, peak: 0.16, decay: 0.06 });
  }
}

export const CONTACT_CUES = { save, tackle };
