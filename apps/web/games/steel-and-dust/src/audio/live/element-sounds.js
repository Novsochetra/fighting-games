import { blip, click, hiss, thump } from './layers.js';

// lightning leaving a fist: a run of hard electric cracks over a buzz that drops away
function zap(live, start) {
  for (let i = 0; i < 5; i++) {
    click(live, { start: start + i * 0.018, volume: 0.12, frequency: 2500 });
  }
  blip(live, { start, frequency: 1180, duration: 0.18, volume: 0.05, wave: 'sawtooth' });
  const crackle = { type: 'highpass', from: 3000, to: 1500, resonance: 1.2 };
  hiss(live, { start, ...crackle, attack: 0.005, duration: 0.25, volume: 0.06 });
}

// a dust devil spinning up: wind that rises in pitch as it gathers
function gust(live, start) {
  const wind = { type: 'bandpass', from: 250, to: 900, resonance: 2.5 };
  hiss(live, { start, ...wind, attack: 0.25, duration: 0.9, volume: 0.1 });
}

// lightning striking the ground: a sharp crack, then thunder rolling away under it
function thunder(live, start) {
  const crack = { type: 'highpass', from: 2400, to: 900, resonance: 0.8 };
  hiss(live, { start, ...crack, attack: 0.003, duration: 0.18, volume: 0.16 });
  thump(live, { start, from: 90, to: 32, duration: 0.9, volume: 0.34 });
  const rumble = { type: 'lowpass', from: 600, to: 120, resonance: 0.7 };
  hiss(live, { start: start + 0.05, ...rumble, attack: 0.08, duration: 1.3, volume: 0.14 });
}

// a furnace breathing out fire: a low roar under a rushing hiss
function flame(live, start) {
  thump(live, { start, from: 70, to: 40, duration: 0.5, volume: 0.2 });
  const rush = { type: 'bandpass', from: 600, to: 1800, resonance: 1.2 };
  hiss(live, { start, ...rush, attack: 0.04, duration: 0.6, volume: 0.12 });
}

// steam escaping a vent: a sharp high hiss that falls away
function steam(live, start) {
  const jet = { type: 'highpass', from: 4200, to: 2400, resonance: 0.9 };
  hiss(live, { start, ...jet, attack: 0.01, duration: 0.55, volume: 0.07 });
}

// molten slag spilling on the ground: a dull crack, then a long crackling sizzle
function sizzle(live, start) {
  thump(live, { start, from: 160, to: 60, duration: 0.18, volume: 0.2 });
  const fry = { type: 'highpass', from: 2600, to: 3600, resonance: 1.5 };
  hiss(live, { start: start + 0.03, ...fry, attack: 0.02, duration: 0.8, volume: 0.06 });
}

// the storm and the forge the later bosses bring: lightning, wind, fire and steam
export const ELEMENT_SOUNDS = { zap, gust, thunder, flame, steam, sizzle };
