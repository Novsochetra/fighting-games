import { blip, hiss, thump } from './layers.js';

// a ram's horn blown across the hills: a low brassy note with its fifth, over the player's breath
function warHorn(live, start) {
  blip(live, { start, frequency: 147, duration: 1.1, volume: 0.15, wave: 'sawtooth' });
  blip(live, {
    start: start + 0.04,
    frequency: 220,
    duration: 0.95,
    volume: 0.07,
    wave: 'sawtooth',
  });
  const breath = { type: 'bandpass', from: 500, to: 900, resonance: 1.4 };
  hiss(live, { start, ...breath, attack: 0.08, duration: 0.9, volume: 0.04 });
}

// a boss gathering its ultimate: a deep drum under wind that rises to a howl
function bossUltimate(live, start) {
  thump(live, { start, from: 80, to: 45, duration: 0.5, volume: 0.36 });
  const wind = { type: 'bandpass', from: 300, to: 2400, resonance: 3 };
  hiss(live, { start, ...wind, attack: 0.5, duration: 1.1, volume: 0.09 });
}

// a wet hiss as venom leaves the fangs
function venomSpit(live, start) {
  const spray = { type: 'bandpass', from: 2600, to: 900, resonance: 2 };
  hiss(live, { start, ...spray, attack: 0.01, duration: 0.22, volume: 0.1 });
  blip(live, { start, frequency: 330, duration: 0.08, volume: 0.05, wave: 'triangle' });
}

// a glob landing: a soft low slap and a short fizz
function splat(live, start) {
  thump(live, { start, from: 180, to: 70, duration: 0.12, volume: 0.16 });
  const fizz = { type: 'highpass', from: 1800, to: 3200, resonance: 1 };
  hiss(live, { start: start + 0.03, ...fizz, attack: 0.01, duration: 0.25, volume: 0.03 });
}

// the gaze: two glassy tones a tritone apart, chiming three times over a shimmer
function hypnosis(live, start) {
  for (let i = 0; i < 3; i++) {
    const at = start + i * 0.12;
    blip(live, { start: at, frequency: 880, duration: 0.5, volume: 0.06, wave: 'sine' });
    blip(live, { start: at, frequency: 1245, duration: 0.45, volume: 0.04, wave: 'sine' });
  }
  const shimmer = { type: 'bandpass', from: 3000, to: 6000, resonance: 4 };
  hiss(live, { start, ...shimmer, attack: 0.05, duration: 0.7, volume: 0.03 });
}

// claws raking into sand: a run of short gritty scrapes over a low rumble
function dig(live, start) {
  thump(live, { start, from: 90, to: 50, duration: 0.3, volume: 0.14 });
  for (let i = 0; i < 4; i++) {
    const grit = { type: 'bandpass', from: 1400, to: 700, resonance: 1.5 };
    hiss(live, { start: start + i * 0.06, ...grit, attack: 0.01, duration: 0.07, volume: 0.06 });
  }
}

// the ground bursting open under the hero: a deep crack and a spray of falling earth
function eruption(live, start) {
  thump(live, { start, from: 120, to: 38, duration: 0.45, volume: 0.32 });
  const earth = { type: 'lowpass', from: 2400, to: 500, resonance: 0.8 };
  hiss(live, { start: start + 0.02, ...earth, attack: 0.01, duration: 0.5, volume: 0.1 });
}

// a wasp coming in: quick sawtooth wingbeats that swell, then fall away
function buzz(live, start) {
  for (let i = 0; i < 8; i++) {
    const volume = 0.012 + 0.008 * Math.min(i, 7 - i);
    blip(live, {
      start: start + i * 0.035,
      frequency: 205 + i * 3,
      duration: 0.05,
      volume,
      wave: 'sawtooth',
    });
  }
}

// a hyena's howl: a wavering cry that climbs, breaks and falls away, over a rough throat
function howl(live, start) {
  const notes = [330, 440, 520, 480, 360];
  notes.forEach((frequency, i) => {
    const at = start + i * 0.12;
    blip(live, { start: at, frequency, duration: 0.2, volume: 0.07, wave: 'sawtooth' });
  });
  const throat = { type: 'bandpass', from: 700, to: 1300, resonance: 2 };
  hiss(live, { start, ...throat, attack: 0.05, duration: 0.6, volume: 0.04 });
}

export const BOSS_SOUNDS = {
  warHorn,
  bossUltimate,
  venomSpit,
  splat,
  hypnosis,
  dig,
  eruption,
  buzz,
  howl,
};
