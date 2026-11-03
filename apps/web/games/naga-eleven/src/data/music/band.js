// A bar is 16 steps of a sixteenth note each, written as tokens: a note (`D5`, `F#4`), `-` holding
// the note before it, `.` a rest. A note may add `+` (struck with its octave, as a roneat player
// does with both mallets) and `~` (rolled, the roneat's tremolo). A drum's tokens are its hits.
export const STEPS_PER_BAR = 16;

// low and high are midi notes: what the voice plays well on a phone's small speaker
export const INSTRUMENTS = {
  // the roneat ek, the xylophone that leads the pinpeat
  roneat: { kind: 'melodic', low: 60, high: 96, level: 0.15, decay: 0.3, rollGap: 0.045 },
  // the kong vong, the circle of gongs that carries the melody's bones
  kong: { kind: 'melodic', low: 48, high: 84, level: 0.09, decay: 1.4 },
  // the tro, a bowed fiddle
  tro: { kind: 'melodic', low: 55, high: 88, level: 0.07, vibrato: 5.5 },
  bass: { kind: 'melodic', low: 33, high: 60, level: 0.18 },
  // the skor thom: T a full low stroke, t a soft one, S a slap on the head's rim
  skor: { kind: 'drum', hits: ['T', 't', 'S'], level: 0.32 },
  // the chhing, tiny cymbals: o rings open (ching), x is closed at once (chhap)
  chhing: { kind: 'drum', hits: ['o', 'x'], level: 0.07 },
};
