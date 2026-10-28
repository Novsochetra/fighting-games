import { hiss, thump } from './layers.js';

// leaves shaken in the canopy overhead: a handful of soft, airy brushes, close together
function rustle(live, start) {
  for (let i = 0; i < 5; i++) {
    const leaves = { type: 'bandpass', from: 3400 - i * 180, to: 2200, resonance: 1.3 };
    const at = start + i * 0.065 + (i % 2) * 0.018;

    hiss(live, { start: at, ...leaves, attack: 0.015, duration: 0.08, volume: 0.03 });
  }
}

// a branch giving way under a raider: a dry crack, a knock of wood, and the leaves let go
function branchSnap(live, start) {
  const crack = { type: 'highpass', from: 2600, to: 1400, resonance: 2.2 };

  hiss(live, { start, ...crack, attack: 0.002, duration: 0.045, volume: 0.12 });
  thump(live, { start, from: 240, to: 110, duration: 0.07, volume: 0.07 });
  rustle(live, start + 0.04);
}

export const AMBUSH_SOUNDS = { rustle, branchSnap };
