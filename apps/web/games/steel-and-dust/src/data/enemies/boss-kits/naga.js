// The Naga Raja is a glider: she rears up and glides over the stone in smooth bursts, keeping the
// middle distance and gliding back from a hero who crowds her. Her Tidal Coil crashes down and rolls
// a wave of moat water along the floor (jump it); her Seven Heads spit water nagas one after another,
// low ones to jump and high ones to stand under. Below 40% the Rainbow Naga sends spirit nagas
// sweeping along the floor, one from each side, and then a serpent of water bursts up under the
// hero; the summoning leaves her spent. Below half health her waves come in pairs
export const NAGA_KIT = {
  movement: 'glider',
  close: { range: 60, moves: ['serpentSlash', 'tailSlam'] },
  skills: [
    { move: 'tidalCoil', range: [90, 400], chance: 0.03, cooldown: 300 },
    { move: 'sevenHeads', range: [90, 320], chance: 0.02, cooldown: 520 },
  ],
  ultimate: { move: 'rainbowNaga', below: 0.4, every: 1500 },
  phaseTwo: {
    below: 0.5,
    pace: 1.2,
    cooldown: 0.7,
    swaps: { tidalCoil: 'tidalCoils' },
  },
};
