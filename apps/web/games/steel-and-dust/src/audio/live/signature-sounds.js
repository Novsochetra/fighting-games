import { blip, crunch, hiss, metal, thump } from './layers.js';

// brambles tearing up through packed dirt
function thorns(live, start) {
  crunch(live, { start, duration: 0.22, volume: 0.22, frequency: 520 });
  thump(live, { start, from: 140, to: 60, duration: 0.18, volume: 0.35 });
  const rip = { type: 'bandpass', from: 900, to: 2600, resonance: 2 };
  hiss(live, { start, ...rip, attack: 0.01, duration: 0.16, volume: 0.08 });
}

// a cloud of tiny bright chirps spreading out
function swarm(live, start) {
  [1760, 2093, 2349, 2637, 3136].forEach((frequency, i) => {
    blip(live, {
      start: start + i * 0.035,
      frequency,
      duration: 0.09,
      volume: 0.035,
      wave: 'sine',
    });
  });
  const shimmer = { type: 'highpass', from: 5000, to: 7000, resonance: 0.8 };
  hiss(live, { start, ...shimmer, attack: 0.04, duration: 0.25, volume: 0.04 });
}

// hooves drumming past under a breathy spirit howl
function stampede(live, start) {
  for (let i = 0; i < 4; i++) {
    thump(live, { start: start + i * 0.07, from: 95, to: 45, duration: 0.12, volume: 0.32 });
  }
  const howl = { type: 'bandpass', from: 500, to: 1400, resonance: 3 };
  hiss(live, { start, ...howl, attack: 0.08, duration: 0.35, volume: 0.07 });
}

// ice locking around a body: a glassy ring and a cracking crust
function freeze(live, start) {
  metal(live, { start, frequencies: [2400, 3600, 5100], duration: 0.5, volume: 0.05 });
  crunch(live, { start, duration: 0.12, volume: 0.12, frequency: 2200 });
  const frost = { type: 'highpass', from: 3000, to: 8000, resonance: 0.9 };
  hiss(live, { start, ...frost, attack: 0.005, duration: 0.3, volume: 0.06 });
}

// a pillar of fire roaring up out of cracked ground
function flames(live, start) {
  thump(live, { start, from: 110, to: 50, duration: 0.2, volume: 0.3 });
  const blaze = { type: 'bandpass', from: 300, to: 1800, resonance: 1.4 };
  hiss(live, { start, ...blaze, attack: 0.03, duration: 0.42, volume: 0.12 });
  crunch(live, { start: start + 0.04, duration: 0.18, volume: 0.08, frequency: 900 });
}

// a body catching light: a short breathy whoosh
function ignite(live, start) {
  const whoosh = { type: 'bandpass', from: 600, to: 2400, resonance: 1.2 };
  hiss(live, { start, ...whoosh, attack: 0.02, duration: 0.22, volume: 0.07 });
}

// the firebird's cry over the rush of its wings
function phoenix(live, start) {
  [1480, 1975, 1660].forEach((frequency, i) => {
    blip(live, {
      start: start + i * 0.09,
      frequency,
      duration: 0.16,
      volume: 0.05,
      wave: 'sawtooth',
    });
  });
  const wings = { type: 'bandpass', from: 400, to: 2200, resonance: 1.6 };
  hiss(live, { start, ...wings, attack: 0.06, duration: 0.6, volume: 0.1 });
}

// a lion's roar: a deep growl rolling up under a rough breathy rasp
function roar(live, start) {
  thump(live, { start, from: 90, to: 140, duration: 0.45, volume: 0.32 });
  const rasp = { type: 'bandpass', from: 260, to: 900, resonance: 2.2 };
  hiss(live, { start, ...rasp, attack: 0.06, duration: 0.55, volume: 0.13 });
  crunch(live, { start: start + 0.05, duration: 0.3, volume: 0.08, frequency: 380 });
}

// heavy paws landing: a soft thud and a puff of dust
function pounce(live, start) {
  thump(live, { start, from: 120, to: 50, duration: 0.16, volume: 0.3 });
  const dust = { type: 'lowpass', from: 1400, to: 500, resonance: 0.8 };
  hiss(live, { start, ...dust, attack: 0.01, duration: 0.14, volume: 0.06 });
}

// an echo of the hero striking again: a soft blow under a short bright chime of gold
function echo(live, start) {
  thump(live, { start, from: 160, to: 70, duration: 0.09, volume: 0.18 });
  metal(live, { start, frequencies: [1760, 2640, 3520], duration: 0.22, volume: 0.03 });
  const breath = { type: 'bandpass', from: 2400, to: 900, resonance: 1.6 };
  hiss(live, { start, ...breath, attack: 0.005, duration: 0.1, volume: 0.05 });
}

// carved stone grinding up out of the ground on the deep beat of a skor drum
function relief(live, start) {
  thump(live, { start, from: 70, to: 40, duration: 0.3, volume: 0.36 });
  crunch(live, { start: start + 0.02, duration: 0.24, volume: 0.12, frequency: 300 });
  const grind = { type: 'lowpass', from: 900, to: 300, resonance: 1.1 };
  hiss(live, { start, ...grind, attack: 0.04, duration: 0.3, volume: 0.08 });
}

// the hero's blade ringing out as it calls a technique by name
function technique(live, start) {
  metal(live, { start, frequencies: [1320, 1980, 2640], duration: 0.35, volume: 0.045 });
  const swell = { type: 'bandpass', from: 1200, to: 4200, resonance: 2.4 };
  hiss(live, { start, ...swell, attack: 0.02, duration: 0.2, volume: 0.06 });
}

export const SIGNATURE_SOUNDS = {
  thorns,
  swarm,
  stampede,
  freeze,
  flames,
  ignite,
  phoenix,
  roar,
  pounce,
  echo,
  relief,
  technique,
};
