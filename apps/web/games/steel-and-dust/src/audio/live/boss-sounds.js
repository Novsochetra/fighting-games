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

export const BOSS_SOUNDS = { warHorn, bossUltimate, venomSpit, splat, hypnosis };
