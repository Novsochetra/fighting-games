// The Warden Ox is a warden: he walks at the hero step by step and never gives ground. His Chain
// Hook drags the hero in for an axe chop, and a hero who crowds him may meet his Guard Counter: a
// blow on it is parried and answered at once. Below 40% his Executioner's Round spins
// him across the arena and back, then he leaps and cleaves the road, splitting it both ways.
// Below half health he guards more often and chops twice
export const OX_KIT = {
  movement: 'warden',
  close: { range: 50, moves: ['swipe', 'slam'] },
  skills: [
    { move: 'guardCounter', range: [0, 80], chance: 0.04, cooldown: 360 },
    { move: 'chainHook', range: [90, 250], chance: 0.05, cooldown: 280 },
  ],
  ultimate: { move: 'executionersRound', below: 0.4, every: 1500 },
  phaseTwo: {
    below: 0.5,
    pace: 1.15,
    cooldown: 0.55,
    swaps: { chainHook: 'chainHookTwice' },
  },
};
