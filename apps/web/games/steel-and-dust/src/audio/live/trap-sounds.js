import { hiss, metal, thump } from './layers.js';

// spikes shooting up out of a stone tile: a knock of stone under a quick ring and scrape of metal
function spikeTrap(live, start) {
  thump(live, { start, from: 240, to: 90, duration: 0.14, volume: 0.18 });
  metal(live, { start, frequencies: [1245, 1760, 2380], duration: 0.22, volume: 0.04 });
  const scrape = { type: 'bandpass', from: 2400, to: 5200, resonance: 2 };
  hiss(live, { start, ...scrape, attack: 0.004, duration: 0.12, volume: 0.07 });
}

// the Mirage Temple's traps
export const TRAP_SOUNDS = { spikeTrap };
