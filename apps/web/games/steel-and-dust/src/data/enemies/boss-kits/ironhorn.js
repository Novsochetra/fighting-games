// Ironhorn fights like a bull: he keeps room to run, rushes the whole screen with his horn and is
// left dazed if he misses and meets the wall; a hero who jumps at him eats a mace uppercut. Below 40%
// he stampedes three times across the screen, each run faster, then stands dazed. Below half health
// his rushes come two at a time
export const IRONHORN_KIT = {
  movement: 'bull',
  close: { range: 44, moves: ['swipe', 'slam'] },
  skills: [
    { move: 'uppercut', range: [0, 70], chance: 0.6, cooldown: 90, airborne: true },
    { move: 'hornRush', range: [90, 400], chance: 0.05, cooldown: 300 },
  ],
  ultimate: { move: 'stampede', below: 0.4, every: 1500 },
  phaseTwo: { below: 0.5, pace: 1.25, cooldown: 0.7, chains: { hornRush: 2 } },
};
