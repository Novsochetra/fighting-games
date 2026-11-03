// the block figure's poses, frame by frame, in degrees: a leg's `thigh` swings it forward and
// `knee` bends it back; an arm's `swing` brings it forward, `raise` lifts it out to the side and
// `elbow` bends it; see skeleton.js for the body
const both = (limb) => ({ left: limb, right: limb });

const IDLE = [
  {
    legs: both({ spread: 5, knee: 4 }),
    arms: both({ raise: 12, elbow: 14, swing: 4 }),
  },
  {
    legs: both({ spread: 5, knee: 10, thigh: 3 }),
    arms: both({ raise: 14, elbow: 22, swing: 6 }),
  },
];

const legInStride = (phase) => ({
  thigh: 38 * Math.sin(phase),
  knee: 12 + 64 * Math.max(0, Math.cos(phase)) ** 1.4,
});

const RUN = Array.from({ length: 6 }, (_, frame) => {
  const phase = (frame / 6) * Math.PI * 2;

  return {
    lean: 12,
    legs: { left: legInStride(phase), right: legInStride(phase + Math.PI) },
    arms: {
      left: { swing: -40 * Math.sin(phase), elbow: 80, raise: 8 },
      right: { swing: 40 * Math.sin(phase), elbow: 80, raise: 8 },
    },
  };
});

const KICK = [
  {
    lean: 2,
    legs: { left: { thigh: 8, knee: 14 }, right: { thigh: 20, knee: 70 } },
    arms: {
      left: { swing: 20, raise: 50, elbow: 30 },
      right: { swing: -24, raise: 36, elbow: 20 },
    },
  },
  {
    lean: -8,
    legs: { left: { thigh: 4, knee: 10 }, right: { thigh: 62, knee: 12 } },
    arms: {
      left: { swing: -10, raise: 60, elbow: 20 },
      right: { swing: 24, raise: 48, elbow: 20 },
    },
  },
  {
    lean: -14,
    legs: { left: { thigh: -2, knee: 8 }, right: { thigh: 92, knee: 8 } },
    arms: {
      left: { swing: -28, raise: 64, elbow: 10 },
      right: { swing: 34, raise: 52, elbow: 14 },
    },
  },
  {
    lean: -2,
    legs: { left: { thigh: 4, knee: 12 }, right: { thigh: 34, knee: 46 } },
    arms: { left: { swing: -8, raise: 30, elbow: 20 }, right: { swing: 10, raise: 26, elbow: 20 } },
  },
];

const SLIDE = [0, 1].map((frame) => ({
  pitch: -52 - frame * 6,
  lean: 10,
  legs: { left: { thigh: -6, knee: 96 }, right: { thigh: 46 + frame * 4, knee: 2 } },
  arms: {
    left: { swing: -70, raise: 34, elbow: 10 },
    right: { swing: 56, raise: 50 + frame * 10, elbow: 30 },
  },
}));

const FALL = [
  {
    pitch: -16,
    lean: -12,
    legs: { left: { thigh: 14, knee: 20 }, right: { thigh: -8, knee: 30 } },
    arms: both({ swing: 34, raise: 72, elbow: 30 }),
  },
  {
    pitch: -54,
    legs: { left: { thigh: 30, knee: 30 }, right: { thigh: 12, knee: 46 } },
    arms: both({ swing: 50, raise: 92, elbow: 20 }),
  },
  {
    pitch: -88,
    legs: { left: { thigh: 8, knee: 10 }, right: { thigh: 40, knee: 82 } },
    arms: both({ swing: 0, raise: 64, elbow: 30 }),
  },
];

// a dive is drawn facing the camera, flying to its right: the screen's left
const DIVE = [
  {
    roll: 22,
    legs: both({ spread: 12, knee: 40, thigh: 24 }),
    arms: both({ raise: 70, elbow: 20 }),
  },
  { roll: 74, lift: 9, legs: both({ spread: 8, knee: 8 }), arms: both({ raise: 168, elbow: 6 }) },
  {
    roll: 88,
    legs: { left: { spread: 6, knee: 30 }, right: { spread: 10 } },
    arms: both({ raise: 162 }),
  },
];

const CELEBRATE = [
  { lift: 1, legs: both({ knee: 20, thigh: 10 }), arms: both({ raise: 150, elbow: 30 }) },
  { lift: 5, legs: both({ knee: 34, thigh: 16 }), arms: both({ raise: 168, elbow: 8 }) },
  { lift: 3, legs: both({ knee: 20, thigh: 10 }), arms: both({ raise: 160, elbow: 16 }) },
  {
    lean: 8,
    legs: both({ knee: 36, thigh: 30, spread: 8 }),
    arms: both({ raise: 120, elbow: 70 }),
  },
];

export const POSES = {
  idle: IDLE,
  run: RUN,
  kick: KICK,
  slide: SLIDE,
  fall: FALL,
  dive: DIVE,
  celebrate: CELEBRATE,
};
