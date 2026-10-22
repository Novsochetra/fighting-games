import { blip, hiss, thump } from './layers.js';

// a wave of moat water rising and rolling: a surge of low rushing water that swells and falls
function tide(live, start) {
  const surge = { type: 'lowpass', from: 500, to: 1800, resonance: 1.2 };
  hiss(live, { start, ...surge, attack: 0.15, duration: 0.9, volume: 0.12 });
  thump(live, { start, from: 90, to: 50, duration: 0.5, volume: 0.12 });
}

// water bursting on stone: a heavy slap and spray falling back
function splash(live, start) {
  thump(live, { start, from: 160, to: 60, duration: 0.25, volume: 0.24 });
  const spray = { type: 'highpass', from: 2400, to: 900, resonance: 0.9 };
  hiss(live, { start, ...spray, attack: 0.01, duration: 0.5, volume: 0.1 });
}

// a hooded head spitting its water naga: a sharp hiss
function nagaHiss(live, start) {
  const breath = { type: 'bandpass', from: 4200, to: 2600, resonance: 2.2 };
  hiss(live, { start, ...breath, attack: 0.01, duration: 0.22, volume: 0.08 });
}

// a spirit naga of the rainbow taking shape: a rising run of bright chimes over rushing water
function rainbow(live, start) {
  [523, 659, 784, 988, 1175, 1319, 1568].forEach((frequency, i) => {
    blip(live, { start: start + i * 0.05, frequency, duration: 0.3, volume: 0.04, wave: 'sine' });
  });
  const rush = { type: 'bandpass', from: 900, to: 2400, resonance: 1 };
  hiss(live, { start, ...rush, attack: 0.1, duration: 0.7, volume: 0.07 });
}

// the Naga Raja's wave, splashes, hissing heads and rainbow
export const MOAT_SOUNDS = { tide, splash, nagaHiss, rainbow };
