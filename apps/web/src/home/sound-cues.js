// Every cue is synthesized, so the home page ships no audio files. A voice is a tone (an oscillator)
// or a breath of filtered noise; frequency is [from, to] in Hz, times and durations in seconds.
const tone = (wave, frequency, { start = 0, duration, gain, attack = 0.004 }) => ({
  kind: 'tone',
  wave,
  frequency,
  start,
  duration,
  gain,
  attack,
});

const noise = (filter, frequency, { start = 0, duration, gain, attack = 0.01, resonance = 1 }) => ({
  kind: 'noise',
  filter,
  frequency,
  resonance,
  start,
  duration,
  gain,
  attack,
});

// A C major arpeggio on the way out, so opening a game always resolves upward.
const LAUNCH_CHIME = [523.25, 659.25, 783.99, 1046.5];

export const CUES = {
  move: [
    tone('triangle', [2200, 1400], { duration: 0.045, gain: 0.1, attack: 0.001 }),
    tone('sine', [880, 660], { duration: 0.07, gain: 0.05, attack: 0.002 }),
    noise('bandpass', [1800, 900], { duration: 0.16, gain: 0.03, resonance: 1.2 }),
  ],
  launch: [
    noise('bandpass', [500, 4200], { duration: 0.5, gain: 0.07, attack: 0.18, resonance: 0.9 }),
    ...LAUNCH_CHIME.map((pitch, i) =>
      tone('sine', [pitch, pitch], {
        start: 0.04 + i * 0.06,
        duration: 0.5 + i * 0.07,
        gain: 0.08,
      }),
    ),
  ],
  favoriteOn: [
    tone('sine', [740, 1110], { duration: 0.12, gain: 0.09 }),
    tone('sine', [1480, 1480], { start: 0.06, duration: 0.2, gain: 0.04 }),
  ],
  favoriteOff: [tone('sine', [880, 520], { duration: 0.12, gain: 0.07 })],
  segment: [
    tone('triangle', [1500, 1100], { duration: 0.035, gain: 0.07, attack: 0.001 }),
    tone('sine', [600, 600], { duration: 0.04, gain: 0.03 }),
  ],
  sheetOpen: [
    noise('lowpass', [400, 2600], { duration: 0.28, gain: 0.05, attack: 0.08 }),
    tone('sine', [440, 660], { duration: 0.2, gain: 0.03, attack: 0.02 }),
  ],
  sheetClose: [noise('lowpass', [2400, 380], { duration: 0.24, gain: 0.045, attack: 0.02 })],
  land: [
    noise('bandpass', [3000, 500], { duration: 0.4, gain: 0.05, attack: 0.03 }),
    tone('sine', [784, 523], { duration: 0.3, gain: 0.04, attack: 0.02 }),
  ],
  locked: [
    tone('sine', [220, 180], { duration: 0.09, gain: 0.08, attack: 0.003 }),
    tone('sine', [196, 150], { start: 0.1, duration: 0.12, gain: 0.07, attack: 0.003 }),
  ],
  soundOn: [
    tone('sine', [660, 660], { duration: 0.12, gain: 0.07 }),
    tone('sine', [990, 990], { start: 0.07, duration: 0.18, gain: 0.06 }),
  ],
};

export const cueNames = () => Object.keys(CUES);
