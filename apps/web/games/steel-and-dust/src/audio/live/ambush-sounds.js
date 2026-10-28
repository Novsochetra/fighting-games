import { click, hiss, metal, thump } from './layers.js';

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

// grit rattling off stone or iron as a raider climbs about on it: small ticks that fall away
function gritTrickle(live, start) {
  for (let i = 0; i < 6; i++) {
    const at = start + i * 0.05 + (i % 3) * 0.012;

    click(live, { start: at, volume: 0.05 * (1 - i * 0.12), frequency: 2600 + (i % 2) * 900 });
  }

  const sand = { type: 'bandpass', from: 2400, to: 1600, resonance: 1 };

  hiss(live, { start, ...sand, attack: 0.01, duration: 0.25, volume: 0.012 });
}

// a raider leaping off a ledge: its feet scuffing the stone, a rush of air, the grit after it
function perchLeap(live, start) {
  const scuff = { type: 'bandpass', from: 900, to: 1800, resonance: 1.4 };
  const rush = { type: 'lowpass', from: 1200, to: 500, resonance: 0.8 };

  hiss(live, { start, ...scuff, attack: 0.004, duration: 0.07, volume: 0.07 });
  hiss(live, { start: start + 0.03, ...rush, attack: 0.03, duration: 0.18, volume: 0.04 });
  gritTrickle(live, start + 0.04);
}

// off ironwork: a boot ringing on a girder as it leaps, then the rust it knocks loose
function clank(live, start) {
  metal(live, { start, frequencies: [740, 1180, 1990], duration: 0.35, volume: 0.05 });
  thump(live, { start, from: 180, to: 90, duration: 0.06, volume: 0.06 });
  gritTrickle(live, start + 0.03);
}

export const AMBUSH_SOUNDS = { rustle, branchSnap, gritTrickle, perchLeap, clank };
