import {
  BAR_GAP,
  BAR_PITCH,
  BELL_PITCH,
  CALL_PITCH,
  HURRY_PITCH,
  INSTRUMENTS,
  MOST_BARS,
  PAPER_PITCH,
  PIECE_VALUES,
  SOUNDS,
  TICK_PITCH,
} from '../data/sounds.js';

// a name such as 'constructor' is on every object, and is no sound
const own = (table, key) =>
  Object.prototype.hasOwnProperty.call(table, key) ? table[key] : undefined;

// an amount that is no piece (a total being counted out) rings as the biggest piece within it
function pitchFor(table, value) {
  const within = PIECE_VALUES.find((piece) => piece <= value);

  return table[within ?? PIECE_VALUES[PIECE_VALUES.length - 1]];
}

function countedBack(pieces) {
  const counted = Array.isArray(pieces) ? pieces.slice(0, MOST_BARS) : [];
  const bars = counted.map((value, i) => ({
    play: 'bar',
    freq: pitchFor(BAR_PITCH, value),
    at: i * BAR_GAP,
  }));

  return [...bars, { play: 'bell', freq: BELL_PITCH, at: counted.length * BAR_GAP }];
}

function call(kind) {
  const [first, second] = own(CALL_PITCH, kind) || CALL_PITCH.shopper;
  const [{ attack, hold, decay }] = INSTRUMENTS.callFirst;

  return [
    { play: 'callFirst', freq: first },
    { play: 'callSecond', freq: second, at: attack + hold + decay },
  ];
}

const BUILT = {
  deal: ({ value }) => [
    { play: 'paper', freq: PAPER_PITCH },
    { play: 'tick', freq: pitchFor(TICK_PITCH, value) },
  ],
  take: ({ value }) => [
    { play: 'dullPaper' },
    { play: 'dullTick', freq: pitchFor(TICK_PITCH, value) },
  ],
  paid: ({ pieces }) => countedBack(pieces),
  arrive: ({ kind }) => call(kind),
  count: ({ value }) => [{ play: 'bar', freq: pitchFor(BAR_PITCH, value) }],
  hurry: ({ seconds }) => [{ play: 'block', freq: own(HURRY_PITCH, seconds) || HURRY_PITCH[3] }],
};

const hertz = (part, pitch) => (part.ratio ? part.ratio * pitch : part.freq);

function struck(voice, strike) {
  return {
    ...voice,
    freq: hertz(voice, strike.freq),
    filter: voice.filter && { ...voice.filter, freq: hertz(voice.filter, strike.freq) },
    gain: voice.gain * (strike.gain ?? 1),
    hold: voice.hold ?? 0,
    at: strike.at ?? 0,
  };
}

export function voicesFor(name, detail) {
  const build = own(BUILT, name);
  const strikes = build ? build(detail || {}) : own(SOUNDS, name) || [];

  return strikes.flatMap((strike) =>
    INSTRUMENTS[strike.play].map((voice) => struck(voice, strike)),
  );
}
