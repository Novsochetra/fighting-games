// A voice is one oscillator or one burst of noise:
//   wave      'sine', 'square' or 'sawtooth', or 'noise' for a burst
//   freq      its pitch in Hz; ratio, in its place, is a multiple of the pitch of the strike
//   to, slide the pitch it slides to and the seconds that takes
//   filter    the biquad it runs through: { type, q, and freq or ratio as above }
//   gain      its loudest, reached after attack seconds, kept for hold, gone after decay
// An instrument is the voices struck together, and a sound is its strikes:
// { play: the instrument, freq: its pitch, at: seconds into the sound, gain: a share of its own }.
export const MASTER_GAIN = 0.9;

const MALLET = {
  wave: 'noise',
  filter: { type: 'highpass', freq: 2500 },
  gain: 0.06,
  attack: 0.001,
  decay: 0.007,
};
const DULL = { type: 'lowpass', freq: 600 };
const MEGAPHONE = { type: 'bandpass', freq: 1400, q: 6 };
const megaphone = (hold, decay) => ({
  wave: 'square',
  ratio: 1,
  filter: MEGAPHONE,
  gain: 0.25,
  attack: 0.008,
  hold,
  decay,
});

export const INSTRUMENTS = {
  paper: [
    {
      wave: 'noise',
      filter: { type: 'bandpass', ratio: 1, q: 1.4 },
      gain: 0.16,
      attack: 0.002,
      decay: 0.033,
    },
  ],
  dullPaper: [{ wave: 'noise', filter: DULL, gain: 0.1, attack: 0.002, decay: 0.033 }],
  tick: [{ wave: 'sine', ratio: 1, gain: 0.12, attack: 0.001, decay: 0.03 }],
  dullTick: [{ wave: 'sine', ratio: 1, filter: DULL, gain: 0.1, attack: 0.001, decay: 0.03 }],
  bar: [
    { wave: 'sine', ratio: 1, gain: 0.2, attack: 0.002, decay: 0.14 },
    { wave: 'sine', ratio: 4, gain: 0.05, attack: 0.002, decay: 0.06 },
    MALLET,
  ],
  bell: [
    { wave: 'sine', ratio: 1, gain: 0.1, attack: 0.002, decay: 0.5 },
    { wave: 'sine', ratio: 2470 / 1760, gain: 0.06, attack: 0.002, decay: 0.5 },
    { wave: 'sine', ratio: 3730 / 1760, gain: 0.035, attack: 0.002, decay: 0.5 },
  ],
  stamp: [
    {
      wave: 'noise',
      filter: { type: 'lowpass', freq: 400 },
      gain: 0.25,
      attack: 0.002,
      decay: 0.048,
    },
    MALLET,
  ],
  knock: [{ wave: 'sine', freq: 180, gain: 0.22, attack: 0.002, decay: 0.038 }, MALLET],
  callFirst: [megaphone(0.08, 0.022)],
  callSecond: [megaphone(0.12, 0.032)],
  twang: [
    { wave: 'sawtooth', freq: 300, to: 120, slide: 0.08, gain: 0.14, attack: 0.002, decay: 0.16 },
  ],
  slat: [
    {
      wave: 'noise',
      filter: { type: 'lowpass', freq: 500 },
      gain: 0.2,
      attack: 0.004,
      decay: 0.045,
    },
  ],
};

// biggest first: a piece's place here is how many steps its bar stands above the lowest
export const PIECE_VALUES = [50000, 20000, 10000, 5000, 2000, 1000, 500, 100];

const STEPS_TO_THE_OCTAVE = 7;
const barAt = (steps) => 196 * 2 ** (steps / STEPS_TO_THE_OCTAVE);
const pitchOfEach = (pitchAt) =>
  Object.fromEntries(PIECE_VALUES.map((value, i) => [value, pitchAt(i)]));

export const BAR_PITCH = pitchOfEach(barAt);
export const TICK_PITCH = pitchOfEach((steps) => 4 * barAt(steps));

export const BELL_PITCH = 1760;
export const PAPER_PITCH = 3500;
export const BAR_GAP = 0.055;
export const MOST_BARS = 8;

export const CALL_PITCH = {
  shopper: [392, 523],
  driver: [294, 247],
  cook: [349, 311],
  students: [659, 784],
};

const SHUTTER_AT = [0, 0.05, 0.105, 0.165, 0.235, 0.315, 0.41, 0.52, 0.65, 0.8, 0.98];
const RISING_BELL_STEPS = [0, 2, 4];

export const SOUNDS = {
  clear: [
    { play: 'paper', freq: 4200 },
    { play: 'paper', freq: 3200, at: 0.045 },
    { play: 'paper', freq: 2400, at: 0.09 },
  ],
  stamp: [{ play: 'stamp' }],
  wrong: [{ play: 'knock' }, { play: 'knock', at: 0.12 }],
  stage: [{ play: 'twang' }],
  extra: [
    { play: 'bar', freq: barAt(3) },
    { play: 'bar', freq: barAt(7) },
    { play: 'bell', freq: BELL_PITCH, at: 0.12 },
  ],
  left: [
    { play: 'bar', freq: barAt(5), gain: 0.5 },
    { play: 'bar', freq: barAt(3), gain: 0.5, at: 0.09 },
    { play: 'bar', freq: barAt(1), gain: 0.5, at: 0.18 },
  ],
  closed: [
    ...SHUTTER_AT.map((at) => ({ play: 'slat', at })),
    { play: 'bar', freq: barAt(0), at: 1.12 },
  ],
  best: RISING_BELL_STEPS.map((steps, i) => ({
    play: 'bell',
    freq: BELL_PITCH * 2 ** (steps / STEPS_TO_THE_OCTAVE),
    at: i * 0.16,
  })),
  tap: [{ play: 'tick', freq: 1000 }],
};
