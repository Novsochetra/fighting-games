// Gravel Khan fights as a duelist: he keeps his distance, feints, and closes with a dash across the
// screen; he calls his raiders with a war horn when he stands alone, and below 40% health he
// looses three crescent waves along the ground that the hero has to jump
export const KHAN_KIT = {
  movement: 'duelist',
  close: { range: 46, moves: ['swipe', 'slam'] },
  skills: [
    { move: 'crescentDash', range: [70, 400], chance: 0.05, cooldown: 300 },
    { move: 'warHorn', range: [60, 400], chance: 0.02, cooldown: 900, alone: true },
  ],
  ultimate: { move: 'tempest', below: 0.4, every: 1500 },
  phaseTwo: { below: 0.5, pace: 1.25, cooldown: 0.7, chains: { crescentDash: 2 } },
};
