import { blip, click, crunch, thump } from './layers.js';

// a dead tree giving way: dry wood cracking in slow, uneven snaps over a low groan
function creak(live, start) {
  blip(live, { start, frequency: 110, duration: 0.5, volume: 0.06, wave: 'sawtooth' });
  [0, 0.11, 0.19, 0.34, 0.42].forEach((at, i) => {
    click(live, { start: start + at, volume: 0.07, frequency: 1500 - i * 160 });
  });
}

// its trunk hitting the road: a deep thud, splintering, and branches snapping after it
function timber(live, start) {
  thump(live, { start, from: 110, to: 30, duration: 0.8, volume: 0.42 });
  crunch(live, { start, duration: 0.4, volume: 0.24, frequency: 900 });
  for (let i = 0; i < 6; i++) {
    click(live, { start: start + 0.08 + i * 0.06, volume: 0.06, frequency: 1800 - i * 150 });
  }
}

export const HAZARD_SOUNDS = { creak, timber };
