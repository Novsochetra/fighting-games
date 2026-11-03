// The arms of the throw-in pose, in the pixels of its 64 by 74 frame (the sheets' frame with room
// over the head): shoulder, elbow, hand, the left arm then the right. Held, the hands are over
// the head either side of the ball; thrown, they reach forward, in front of the chest seen from
// the front, and on over the head from behind.
export const THROW_ARMS = {
  south: {
    hold: [
      [
        [21, 27],
        [17, 17],
        [26, 8],
      ],
      [
        [42, 27],
        [46, 17],
        [37, 8],
      ],
    ],
    release: [
      [
        [21, 27],
        [17, 27],
        [27, 33],
      ],
      [
        [42, 27],
        [46, 27],
        [36, 33],
      ],
    ],
  },
  north: {
    hold: [
      [
        [23, 33],
        [20, 21],
        [26, 11],
      ],
      [
        [41, 33],
        [44, 21],
        [37, 11],
      ],
    ],
    release: [
      [
        [23, 33],
        [21, 24],
        [27, 16],
      ],
      [
        [41, 33],
        [43, 24],
        [36, 16],
      ],
    ],
  },
};

// where the sheets' own arms are taken off: rows of the source frame, and the columns left of and
// right of the body beyond which a pixel is arm
export const SHEET_ARMS = {
  south: { image: 'celebrate', x: 192, y: 0, rows: [0, 16], left: 21, right: 40 },
  north: { image: 'idle', x: 0, y: 248, rows: [29, 42], left: 24, right: 39 },
};
