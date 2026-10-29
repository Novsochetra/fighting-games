// each cue twice: for a phone, a vibration pattern (milliseconds on, off, on...), and for a gamepad,
// rumbles of its heavy low motor (`strong`) and its light high one (`weak`), from 0 to 1, each
// after a `wait` in milliseconds; a pad's motors take a moment to spin up, so it rumbles longer
export const HAPTIC_CUES = {
  // a touch control pressed, or the stick or d-pad turned a new way: a tick under the thumb, as a
  // phone's keyboard gives, shorter than a blow landing so the two never blur
  tap: { phone: 4, pad: [{ ms: 20, strong: 0, weak: 0.15 }] },
  hit: { phone: 7, pad: [{ ms: 40, strong: 0, weak: 0.4 }] },
  bigHit: { phone: 18, pad: [{ ms: 90, strong: 0.45, weak: 0.7 }] },
  hurt: { phone: 40, pad: [{ ms: 150, strong: 0.9, weak: 0.3 }] },
  knockOut: { phone: 22, pad: [{ ms: 100, strong: 0.6, weak: 0.5 }] },
  bossKnockOut: {
    phone: [60, 40, 90],
    pad: [
      { ms: 140, strong: 1, weak: 0.7 },
      { wait: 80, ms: 320, strong: 0.8, weak: 0.3 },
    ],
  },
  // it swells over the cut-in, while the world stands still, and is over before the first blow,
  // which would cut it short and can land on the cut-in's last tick, 45 ticks (750 ms) in
  ultimate: {
    phone: [30, 40, 50, 40, 220],
    pad: [
      { ms: 150, strong: 0.3, weak: 0.8 },
      { ms: 200, strong: 0.7, weak: 0.6 },
      { ms: 300, strong: 1, weak: 0.4 },
    ],
  },
  weapon: { phone: 15, pad: [{ ms: 60, strong: 0.2, weak: 0.5 }] },
  gem: { phone: 12, pad: [{ ms: 35, strong: 0, weak: 0.35 }] },
  clear: {
    phone: [40, 60, 40, 60, 120],
    pad: [
      { ms: 70, strong: 0.3, weak: 0.5 },
      { wait: 90, ms: 70, strong: 0.3, weak: 0.5 },
      { wait: 90, ms: 220, strong: 0.6, weak: 0.6 },
    ],
  },
};
