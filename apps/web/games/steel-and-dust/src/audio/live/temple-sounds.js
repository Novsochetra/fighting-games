import { blip, click, crunch, hiss, thump } from './layers.js';

// a body dissolving into sand and stepping out of it: a rising glassy shimmer over pouring grains
function mirage(live, start) {
  [660, 880, 1175].forEach((frequency, i) => {
    blip(live, { start: start + i * 0.05, frequency, duration: 0.35, volume: 0.04, wave: 'sine' });
  });
  const grains = { type: 'bandpass', from: 5200, to: 2600, resonance: 1.4 };
  hiss(live, { start, ...grains, attack: 0.04, duration: 0.5, volume: 0.06 });
}

// a carpet of beetles pouring out of the sand: a rush of tiny dry clicks over a sandy hiss
function scarabs(live, start) {
  for (let i = 0; i < 10; i++) {
    const frequency = 3000 + (i % 3) * 700;
    click(live, { start: start + i * 0.028 + (i % 2) * 0.009, volume: 0.05, frequency });
  }
  const sand = { type: 'bandpass', from: 2400, to: 1400, resonance: 1.2 };
  hiss(live, { start, ...sand, attack: 0.02, duration: 0.4, volume: 0.07 });
}

// the curse laid on the hero: a low bell over a drone that swells
function curse(live, start) {
  blip(live, { start, frequency: 110, duration: 1.4, volume: 0.12, wave: 'sawtooth' });
  blip(live, { start, frequency: 523, duration: 1.2, volume: 0.06, wave: 'sine' });
  blip(live, { start: start + 0.02, frequency: 740, duration: 1, volume: 0.04, wave: 'sine' });
  const breath = { type: 'bandpass', from: 400, to: 1200, resonance: 2 };
  hiss(live, { start, ...breath, attack: 0.4, duration: 1.2, volume: 0.05 });
}

// a clay jar breaking: a hollow knock, a gritty crack and the shards rattling down
function jarBreak(live, start) {
  thump(live, { start, from: 320, to: 140, duration: 0.1, volume: 0.18 });
  crunch(live, { start, duration: 0.18, volume: 0.22, frequency: 1300 });
  for (let i = 0; i < 4; i++) {
    click(live, { start: start + 0.08 + i * 0.05, volume: 0.06, frequency: 2600 - i * 300 });
  }
}

// the sun over him bursting: a bright chime falling away over a burst of light
function sunBreak(live, start) {
  [1568, 1175, 880, 659].forEach((frequency, i) => {
    blip(live, { start: start + i * 0.07, frequency, duration: 0.4, volume: 0.06, wave: 'sine' });
  });
  thump(live, { start, from: 140, to: 50, duration: 0.4, volume: 0.22 });
  const flare = { type: 'highpass', from: 3000, to: 6000, resonance: 0.8 };
  hiss(live, { start, ...flare, attack: 0.01, duration: 0.6, volume: 0.06 });
}

// the curse burning the hero: a column of light slamming down, a deep blast and a ringing tail
function sunfall(live, start) {
  const fall = { type: 'bandpass', from: 6000, to: 900, resonance: 1.5 };
  hiss(live, { start, ...fall, attack: 0.01, duration: 0.25, volume: 0.12 });
  thump(live, { start: start + 0.08, from: 110, to: 34, duration: 0.8, volume: 0.36 });
  blip(live, { start: start + 0.08, frequency: 988, duration: 0.9, volume: 0.05, wave: 'sine' });
}

// a bolt of mirage light leaving a copy's orb: a short warble that dips
function mirageBolt(live, start) {
  blip(live, { start, frequency: 1320, duration: 0.12, volume: 0.05, wave: 'square' });
  blip(live, { start: start + 0.05, frequency: 990, duration: 0.14, volume: 0.04, wave: 'sine' });
}

// the Sand Pharaoh's sand, scarabs, curse and sun
export const TEMPLE_SOUNDS = { mirage, scarabs, curse, jarBreak, sunBreak, sunfall, mirageBolt };
