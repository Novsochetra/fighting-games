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

// the Shade's blade ringing out as it calls a technique by name
function technique(live, start) {
  metal(live, { start, frequencies: [1320, 1980, 2640], duration: 0.35, volume: 0.045 });
  const swell = { type: 'bandpass', from: 1200, to: 4200, resonance: 2.4 };
  hiss(live, { start, ...swell, attack: 0.02, duration: 0.2, volume: 0.06 });
}

export const SIGNATURE_SOUNDS = { thorns, swarm, stampede, freeze, technique };
