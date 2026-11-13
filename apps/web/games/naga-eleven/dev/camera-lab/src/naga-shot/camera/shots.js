// written as the game's shots are (src/data/shots.js), but step 0 here is the play's own framing,
// two of the lab's pixels to an art pixel, so a whole step more zooms in up to 4
export const NAGA_SHOTS = {
  awakening: [
    { from: 0, on: 'play', step: 0 },
    { from: 34, on: 'player', step: 1, glide: 26 },
  ],
  charge: [
    { from: 0, on: 'kick', step: 1 },
    { from: 22, on: 'kick', step: 2, glide: 18 },
    { from: 50, on: 'ball', step: 3, glide: 16 },
  ],
  manifest: [
    { from: 0, on: 'naga', step: 1 },
    { from: 30, on: 'rise', step: 1, glide: 30 },
  ],
  impact: [
    { from: 0, on: 'ball', step: 3 },
    { from: 8, on: 'ball', step: 4 },
    { from: 22, on: 'ahead', step: 2, glide: 16 },
  ],
  flight: [
    { from: 0, on: 'ahead', step: 2 },
    { from: 34, on: 'ahead', step: 1, glide: 22 },
  ],
  keeper: [
    { from: 0, on: 'keeper', step: 2 },
    { from: 26, on: 'keeper', step: 3, glide: 30 },
  ],
  collision: [
    { from: 0, on: 'contact', step: 3 },
    { from: 14, on: 'contact', step: 2, glide: 22 },
  ],
  aftermath: [
    { from: 0, on: 'settle', step: 2 },
    { from: 34, on: 'rest', step: 0, glide: 56 },
  ],
};

export const MOST_NAGA_STEP = 4;

// strength in art pixels
export const NAGA_SHAKES = {
  pulse: { strength: 2, ticks: 10 },
  hit: { strength: 3, ticks: 16 },
  crash: { strength: 5, ticks: 22 },
};
