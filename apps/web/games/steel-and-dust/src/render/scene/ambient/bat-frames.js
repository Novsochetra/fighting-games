// wing poses as [x, y, width, height] rects, the body on the same rows in every pose: a near bat
// beats up, level, down, level; a far one only up and down
const NEAR_POSES = [
  [
    [0, 0, 1, 1],
    [6, 0, 1, 1],
    [1, 1, 1, 1],
    [5, 1, 1, 1],
    [2, 2, 3, 1],
    [3, 3, 1, 1],
  ],
  [
    [3, 1, 1, 1],
    [1, 2, 5, 1],
    [0, 3, 1, 1],
    [3, 3, 1, 1],
    [6, 3, 1, 1],
  ],
  [
    [2, 1, 3, 1],
    [1, 2, 5, 1],
    [0, 3, 1, 1],
    [6, 3, 1, 1],
  ],
];

const FAR_POSES = [
  [
    [0, 0, 1, 1],
    [4, 0, 1, 1],
    [1, 1, 1, 1],
    [3, 1, 1, 1],
    [2, 2, 1, 1],
  ],
  [
    [1, 1, 3, 1],
    [0, 2, 1, 1],
    [2, 2, 1, 1],
    [4, 2, 1, 1],
  ],
];

const NEAR_BEAT = [0, 1, 2, 1];

export const NEAR_WIDTH = 7;

export function batPose(far, beat) {
  if (far) {
    return FAR_POSES[beat % FAR_POSES.length];
  }
  return NEAR_POSES[NEAR_BEAT[beat % NEAR_BEAT.length]];
}
