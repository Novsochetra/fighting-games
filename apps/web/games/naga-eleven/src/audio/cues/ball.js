import { hiss, ring, thud } from './parts.js';

const share = (value, fallback) =>
  Math.min(1, Math.max(0, Number.isFinite(value) ? value : fallback));

// the boot's thump and the lace's click; a hard strike adds the rush of the ball leaving
function kick(voice, { start, power }) {
  const strength = share(power, 0.6);

  thud(voice, {
    start,
    from: 160 + 50 * strength,
    to: 48,
    peak: 0.3 + 0.45 * strength,
    decay: 0.12 + 0.1 * strength,
  });
  hiss(voice, { start, type: 'highpass', from: 2600, peak: 0.1 + 0.12 * strength, decay: 0.012 });

  if (strength > 0.55) {
    hiss(voice, {
      start: start + 0.02,
      from: 900,
      to: 2600,
      resonance: 1.2,
      peak: 0.1 * strength,
      attack: 0.04,
      decay: 0.26,
    });
  }
}

function pass(voice, { start }) {
  thud(voice, { start, from: 240, to: 120, peak: 0.22, decay: 0.07 });
  hiss(voice, { start, from: 1800, resonance: 1.5, peak: 0.06, decay: 0.02 });
}

// scooped under the ball: deeper, with the air it is lifted into
function loft(voice, { start }) {
  thud(voice, { start, from: 180, to: 70, peak: 0.32, decay: 0.11 });
  hiss(voice, { start: start + 0.01, type: 'lowpass', from: 900, peak: 0.1, decay: 0.08 });
  hiss(voice, {
    start: start + 0.03,
    from: 700,
    to: 1600,
    resonance: 1,
    peak: 0.05,
    attack: 0.05,
    decay: 0.3,
  });
}

function header(voice, { start }) {
  thud(voice, { start, wave: 'triangle', from: 270, to: 170, peak: 0.3, decay: 0.07 });
  hiss(voice, { start, type: 'lowpass', from: 1200, peak: 0.12, decay: 0.05 });
}

// the ball on the frame: a ringing tonk, a little higher off the bar than off a post
function post(voice, { start, bar = false }) {
  ring(voice, { start, frequency: bar ? 620 : 540, ratios: [1, 2.4, 3.9], peak: 0.2, decay: 0.7 });
  thud(voice, { start, from: 130, to: 80, peak: 0.25, decay: 0.08 });
}

function net(voice, { start }) {
  hiss(voice, {
    start,
    from: 3600,
    to: 1700,
    resonance: 0.8,
    peak: 0.24,
    attack: 0.01,
    decay: 0.45,
  });
  thud(voice, { start, from: 95, to: 60, peak: 0.18, decay: 0.15 });
}

export const BALL_CUES = { kick, pass, loft, header, post, net };
