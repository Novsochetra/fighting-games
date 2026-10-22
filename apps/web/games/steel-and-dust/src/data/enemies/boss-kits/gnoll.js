// The Gnoll Packlord is a fast pack hunter: he darts in and out of reach, pounces from afar on the
// spot the hero stands on (the shadow is marked as he leaps), and with no raider at his side howls
// the pack in. Below 40% his eyes burn red in a Blood Frenzy, five lunges from wall to wall that
// feed him on every hit, after which he stands panting. Below half health he calls three hounds
export const GNOLL_KIT = {
  movement: 'packHunter',
  close: { range: 44, moves: ['swipe', 'slam'] },
  skills: [
    { move: 'leapingMaul', range: [70, 220], chance: 0.05, cooldown: 220 },
    { move: 'packCall', range: [0, 400], chance: 0.02, cooldown: 900, alone: true },
  ],
  ultimate: { move: 'bloodFrenzy', below: 0.4, every: 1500 },
  phaseTwo: {
    below: 0.5,
    pace: 1.25,
    cooldown: 0.7,
    swaps: { packCall: 'packCallThree' },
  },
};
