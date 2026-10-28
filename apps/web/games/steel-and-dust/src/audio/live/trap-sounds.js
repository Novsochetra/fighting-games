import { hiss, metal, thump } from './layers.js';

// spikes shooting up out of a stone tile: a knock of stone under a quick ring and scrape of metal
function spikeTrap(live, start) {
  thump(live, { start, from: 240, to: 90, duration: 0.14, volume: 0.18 });
  metal(live, { start, frequencies: [1245, 1760, 2380], duration: 0.22, volume: 0.04 });
  const scrape = { type: 'bandpass', from: 2400, to: 5200, resonance: 2 };
  hiss(live, { start, ...scrape, attack: 0.004, duration: 0.12, volume: 0.07 });
}

// a carved boulder rolling down the road: a long low rumble with stone knocking under it, fading as
// it rolls on
function boulderRoll(live, start) {
  thump(live, { start, from: 62, to: 36, duration: 2, volume: 0.3 });
  const grind = { type: 'bandpass', from: 260, to: 160, resonance: 1.6 };
  hiss(live, { start, ...grind, attack: 0.2, duration: 1.8, volume: 0.1 });
  for (let i = 0; i < 6; i++) {
    thump(live, { start: start + 0.2 + i * 0.3, from: 120, to: 60, duration: 0.12, volume: 0.1 });
  }
}

// the Mirage Temple's traps
export const TRAP_SOUNDS = { spikeTrap, boulderRoll };
