// Points measured off the Ember Shade's sheets, in world pixels from its feet as it faces right: its
// heavies play strips that draw their own blade and smear, where the pose rig's joints do not reach.

// where its hands are in each frame of the strips its heavies play
export const HANDS = {
  cleave: [
    [4.5, -20.5],
    [1, -32],
    [2, -31.5],
    [9, -10],
  ],
  thrust: [
    [-2, -15],
    [-4, -16],
    [1, -15],
    [8, -17],
  ],
  spin_slash: [
    [5, -13],
    [-4, -16],
    [9, -23],
    [10, -16],
    [3, -10],
    [5, -10],
  ],
  slash2: [
    [-5, -13],
    [-6, -14],
    [6, -15],
    [-6, -12],
  ],
  rising_dragon: [
    [6, -8],
    [10, -18],
    [8, -25],
  ],
  meteor_slash: [
    [8, -11],
    [0, -24],
    [1, -25],
    [10, -10],
  ],
  plunge: [
    [6, -9],
    [-1, -20],
    [6, -20],
  ],
};

// the smear each strip draws as it strikes, as a line through these points
export const SMEARS = {
  cleave: [
    [-2, -37],
    [12, -30],
    [17, -18],
    [14, -3],
  ],
  thrust: [
    [0, -17],
    [20, -17],
  ],
  slash2: [
    [-15, -35],
    [8, -35],
    [18, -20],
    [9, -2],
  ],
  rising_dragon: [
    [9, -37],
    [18, -23],
    [12, -8],
    [1, -1],
  ],
  meteor_slash: [
    [-2, -38],
    [14, -26],
    [18, -10],
    [18, -1],
  ],
  plunge: [
    [2, -38],
    [18, -23],
    [16, -2],
  ],
};

// the spin's smear is a ring round the Shade
export const SPIN_RING = { x: 0, y: -18, radius: 17 };

// the small of its back, where a phoenix wing grows from
export const BACK = [-3, -21];

// roughly where its face is in each strip, which the fire in its hands keeps clear of
export const FACES = {
  cleave: [0, -25],
  thrust: [2, -23],
  spin_slash: [4, -25],
  slash2: [0, -26],
  rising_dragon: [4, -21],
  meteor_slash: [1, -25],
  plunge: [2, -27],
};
