import { blip, click, crunch, hiss, thump } from './layers.js';

// stone eyes kindling: a low hum that rises into a glassy ring
function stoneGaze(live, start) {
  blip(live, { start, frequency: 98, duration: 0.6, volume: 0.1, wave: 'sawtooth' });
  [392, 587, 784].forEach((frequency, i) => {
    blip(live, {
      start: start + 0.1 + i * 0.08,
      frequency,
      duration: 0.4,
      volume: 0.04,
      wave: 'sine',
    });
  });
}

// a pillar of gold roaring up out of the road: a bright rush over a deep blast
function goldPillar(live, start) {
  const rush = { type: 'bandpass', from: 900, to: 5200, resonance: 1.3 };
  hiss(live, { start, ...rush, attack: 0.02, duration: 0.45, volume: 0.1 });
  thump(live, { start, from: 160, to: 46, duration: 0.5, volume: 0.28 });
  blip(live, { start: start + 0.04, frequency: 1175, duration: 0.5, volume: 0.04, wave: 'sine' });
}

// fists in the ground and roots tearing up through it: creaks over a crunching of earth
function roots(live, start) {
  thump(live, { start, from: 120, to: 40, duration: 0.45, volume: 0.3 });
  crunch(live, { start: start + 0.05, duration: 0.3, volume: 0.2, frequency: 700 });
  for (let i = 0; i < 5; i++) {
    click(live, { start: start + 0.1 + i * 0.06, volume: 0.05, frequency: 900 - i * 90 });
  }
}

// a giant face grinding up out of the road: a long rumble and stone scraping on stone
function faceRise(live, start) {
  thump(live, { start, from: 70, to: 32, duration: 1, volume: 0.32 });
  const grind = { type: 'bandpass', from: 300, to: 700, resonance: 2.2 };
  hiss(live, { start, ...grind, attack: 0.15, duration: 0.8, volume: 0.09 });
}

// the face breathing gold: a roaring blast with a choir-like ring held over it
function faceBeam(live, start) {
  const roar = { type: 'bandpass', from: 2400, to: 1200, resonance: 1.1 };
  hiss(live, { start, ...roar, attack: 0.01, duration: 0.5, volume: 0.13 });
  thump(live, { start, from: 130, to: 40, duration: 0.6, volume: 0.3 });
  [523, 659, 784].forEach((frequency) => {
    blip(live, { start, frequency, duration: 0.5, volume: 0.035, wave: 'triangle' });
  });
}

// the guardian falling to rubble: a heavy crash and stones rattling down
function crumble(live, start) {
  thump(live, { start, from: 90, to: 28, duration: 0.9, volume: 0.4 });
  crunch(live, { start, duration: 0.5, volume: 0.28, frequency: 500 });
  for (let i = 0; i < 7; i++) {
    click(live, { start: start + 0.15 + i * 0.07, volume: 0.06, frequency: 1400 - i * 120 });
  }
}

// and building himself back up: stones knocking together, then a rising chord of gold
function reform(live, start) {
  for (let i = 0; i < 5; i++) {
    click(live, { start: start + i * 0.05, volume: 0.06, frequency: 700 + i * 160 });
  }
  [262, 392, 523, 784].forEach((frequency, i) => {
    blip(live, {
      start: start + 0.2 + i * 0.09,
      frequency,
      duration: 0.6,
      volume: 0.05,
      wave: 'sine',
    });
  });
}

// the Bayon Guardian's gaze, pillars, roots, faces and his crumbling
export const BAYON_SOUNDS = { stoneGaze, goldPillar, roots, faceRise, faceBeam, crumble, reform };
