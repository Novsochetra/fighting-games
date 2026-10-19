import { blip } from './layers.js';
import { biquad, envelopeGain, oscillator } from './nodes.js';

function ui(live, start) {
  blip(live, { start, frequency: 1175, duration: 0.035, volume: 0.06 });
}

function uiOk(live, start) {
  blip(live, { start, frequency: 880, duration: 0.06, volume: 0.08 });
  blip(live, { start: start + 0.05, frequency: 1320, duration: 0.09, volume: 0.08 });
}

function uiBack(live, start) {
  const destination = live.chain.effectsBus;
  const envelope = envelopeGain(live, {
    destination,
    start,
    attack: 0.004,
    peak: 0.07,
    decay: 0.07,
  });
  oscillator(live, {
    wave: 'triangle',
    from: 720,
    to: 480,
    start,
    duration: 0.08,
    destination: envelope,
  });
}

function combo(live, start) {
  blip(live, { start, frequency: 988, duration: 0.12, volume: 0.09 });
  blip(live, { start: start + 0.07, frequency: 1480, duration: 0.2, volume: 0.09 });
  blip(live, { start: start + 0.07, frequency: 1976, duration: 0.16, volume: 0.03, wave: 'sine' });
}

function lowDurability(live, start) {
  blip(live, { start, frequency: 330, duration: 0.07, volume: 0.1, wave: 'square' });
  blip(live, { start: start + 0.11, frequency: 330, duration: 0.07, volume: 0.1, wave: 'square' });
}

function go(live, start) {
  blip(live, { start, frequency: 659, duration: 0.09, volume: 0.12 });
  blip(live, { start: start + 0.1, frequency: 988, duration: 0.14, volume: 0.13 });
}

function pickup(live, start) {
  [784, 988, 1319].forEach((frequency, i) =>
    blip(live, { start: start + i * 0.06, frequency, duration: 0.14, volume: 0.13 }),
  );
  blip(live, { start: start + 0.18, frequency: 1976, duration: 0.2, volume: 0.05, wave: 'sine' });
}

function heal(live, start) {
  const destination = live.chain.effectsBus;
  const envelope = envelopeGain(live, {
    destination,
    start,
    attack: 0.02,
    peak: 0.14,
    decay: 0.28,
  });
  const lowpass = biquad(live, {
    type: 'lowpass',
    from: 2500,
    to: 2500,
    resonance: 0.7,
    start,
    duration: 0.3,
    destination: envelope,
  });
  oscillator(live, {
    wave: 'triangle',
    from: 523,
    to: 784,
    start,
    duration: 0.3,
    destination: lowpass,
    glide: 0.18,
  });
  blip(live, { start: start + 0.12, frequency: 1047, duration: 0.3, volume: 0.06, wave: 'sine' });
}

function warn(live, start) {
  const destination = live.chain.effectsBus;
  const envelope = envelopeGain(live, {
    destination,
    start,
    attack: 0.005,
    peak: 0.16,
    decay: 0.13,
  });
  const lowpass = biquad(live, {
    type: 'lowpass',
    from: 420,
    to: 300,
    resonance: 1.5,
    start,
    duration: 0.14,
    destination: envelope,
  });
  oscillator(live, {
    wave: 'sawtooth',
    from: 98,
    to: 92,
    start,
    duration: 0.14,
    destination: lowpass,
  });
}

export const MENU_SOUNDS = { ui, uiOk, uiBack, combo, lowDurability, go, pickup, heal, warn };
