// The Storm Djinn floats at the edge of his reach and vanishes in a whirl of sand when the hero
// closes in. His Thunder Fist sends a bolt along the floor, and his Dust Devil a tornado that drifts
// after the hero, pulls them in and throws them high. Below 40% he raises the Eye of the Storm:
// lightning strikes marked spots in three waves, then one great strike. Below half health he
// raises two dust devils at once, one at each side of the hero
export const DJINN_KIT = {
  movement: 'floater',
  close: { range: 44, moves: ['swipe', 'slam'] },
  skills: [
    { move: 'thunderFist', range: [60, 320], chance: 0.04, cooldown: 200 },
    { move: 'dustDevil', range: [50, 400], chance: 0.025, cooldown: 600 },
  ],
  ultimate: { move: 'eyeOfStorm', below: 0.4, every: 1500 },
  phaseTwo: {
    below: 0.5,
    pace: 1.25,
    cooldown: 0.7,
    swaps: { dustDevil: 'dustDevils' },
  },
};
