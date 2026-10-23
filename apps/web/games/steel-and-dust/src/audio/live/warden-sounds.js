import { blip, click, crunch, hiss, metal, thump } from './layers.js';

// the hook flung out: a whip of air and the chain paying out link by link
function chainHook(live, start) {
  const whip = { type: 'bandpass', from: 900, to: 2600, resonance: 1.6 };
  hiss(live, { start, ...whip, attack: 0.01, duration: 0.2, volume: 0.08 });
  for (let i = 0; i < 7; i++) {
    click(live, { start: start + 0.03 + i * 0.035, volume: 0.05, frequency: 3400 - i * 120 });
  }
}

// a blow turned on his guard: a bright ringing clang with a shimmer, the hero's arm jarred
function parry(live, start) {
  metal(live, { start, frequencies: [1180, 1770, 2650, 3540], duration: 0.6, volume: 0.16 });
  blip(live, { start, frequency: 1568, duration: 0.35, volume: 0.05, wave: 'sine' });
  const shimmer = { type: 'highpass', from: 4200, to: 6000, resonance: 1 };
  hiss(live, { start, ...shimmer, attack: 0.005, duration: 0.3, volume: 0.03 });
}

// the hammer sweeping round him: a deep rushing whoosh that rises and falls
function axeWhirl(live, start) {
  const rush = { type: 'bandpass', from: 380, to: 1100, resonance: 2.2 };
  hiss(live, { start, ...rush, attack: 0.08, duration: 0.22, volume: 0.09 });
}

// the hammer splitting the road: a crushing blow, the stone cracking and grit falling
function cleave(live, start) {
  thump(live, { start, from: 110, to: 34, duration: 0.55, volume: 0.36 });
  crunch(live, { start, duration: 0.35, volume: 0.24, frequency: 700 });
  const grit = { type: 'lowpass', from: 2600, to: 600, resonance: 0.8 };
  hiss(live, { start: start + 0.05, ...grit, attack: 0.02, duration: 0.6, volume: 0.07 });
}

export const WARDEN_SOUNDS = { chainHook, parry, axeWhirl, cleave };
