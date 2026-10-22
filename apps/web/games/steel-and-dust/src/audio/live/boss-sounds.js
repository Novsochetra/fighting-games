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

export const BOSS_SOUNDS = { warHorn, bossUltimate };
