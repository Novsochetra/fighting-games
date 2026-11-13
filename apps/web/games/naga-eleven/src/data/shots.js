// The cinematic camera's shots (README "The cinematic camera"). Each stage of a duel's show is a
// list of shots in ticks of the stage at its full length: from `from` the camera looks at `on`, a
// point the stage names, `step` zoom steps in (0 to 3, each one more canvas pixel to an art
// pixel), and with `glide` it eases there over that many ticks from where the shot before looked;
// without, it cuts

export const CUTIN_SHOTS = {
  // the band's flash at ticks 9 to 13 hides the cut in to the face
  portrait: [
    { from: 0, on: 'band', step: 0 },
    { from: 11, on: 'face', step: 1 },
    { from: 14, on: 'ahead', step: 1, glide: 50 },
  ],
  // the kick lands on its fourth frame, from tick 18
  strike: [
    { from: 0, on: 'band', step: 0 },
    { from: 18, on: 'boot', step: 1 },
    { from: 21, on: 'boot', step: 2 },
    { from: 30, on: 'band', step: 0 },
  ],
};

export const CLASH_SHOTS = [
  { from: 0, on: 'middle', step: 0 },
  { from: 28, on: 'meeting', step: 1, glide: 26 },
  { from: 54, on: 'impact', step: 2 },
  { from: 66, on: 'impact', step: 1 },
  { from: 82, on: 'middle', step: 0 },
];

export const FINALE_SHOTS = [
  { from: 0, on: 'middle', step: 2 },
  { from: 12, on: 'middle', step: 0 },
  { from: 30, on: 'keeper', step: 1 },
  { from: 46, on: 'keeper', step: 2 },
];

export const CHASE_SHOTS = [
  { from: 0, on: 'ball', step: 1 },
  { from: 26, on: 'ball', step: 2 },
];

// the save cam's contact is at tick 40 (src/render/save-cam/timing.js)
export const SAVE_CAM_SHOTS = {
  opening: [
    { from: 0, on: 'goal', step: 1 },
    { from: 14, on: 'aim', step: 1, glide: 24 },
  ],
  catch: [
    { from: 40, on: 'gloves', step: 2 },
    { from: 50, on: 'gloves', step: 3 },
    { from: 70, on: 'keeper', step: 1, glide: 14 },
  ],
  parry: [
    { from: 40, on: 'gloves', step: 2 },
    { from: 46, on: 'ball', step: 1, glide: 10 },
    { from: 68, on: 'goal', step: 0 },
  ],
  punch: [
    { from: 40, on: 'gloves', step: 3 },
    { from: 46, on: 'ball', step: 1, glide: 6 },
    { from: 62, on: 'keeper', step: 1, glide: 14 },
  ],
  wall: [
    { from: 40, on: 'keeper', step: 2 },
    { from: 46, on: 'keeper', step: 0 },
  ],
  goal: [
    { from: 40, on: 'ball', step: 2 },
    { from: 52, on: 'ball', step: 1, glide: 12 },
    { from: 70, on: 'goal', step: 0 },
  ],
  miss: [
    { from: 40, on: 'ball', step: 1, glide: 8 },
    { from: 62, on: 'goal', step: 0 },
  ],
};

const MISSES = { wide: 'miss', post: 'miss' };

export const saveCamShots = (outcome) => [
  ...SAVE_CAM_SHOTS.opening,
  ...(SAVE_CAM_SHOTS[MISSES[outcome] ?? outcome] ?? SAVE_CAM_SHOTS.catch),
];
