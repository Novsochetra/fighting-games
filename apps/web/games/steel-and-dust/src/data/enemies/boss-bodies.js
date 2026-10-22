// each boss's body as its art is drawn, in its own units (world pixels at scale 1, facing right):
// `hurtShape` is [behind its feet, top, width, height] of the body that takes blows, and `reach`
// the [ahead, top, width, height] of the shared swings, measured on each sheet's strike frames, so
// a blow lands where the weapon is drawn and a hero's blow lands where the body is
const COLOSSUS = {
  hurtShape: [17, 43, 34, 43],
  reach: {
    swipe: [2, -32, 40, 28],
    slam: [0, -32, 32, 32],
    charge: [2, -38, 27, 32],
  },
};

const SERPENT = { hurtShape: [8, 36, 20, 36] };

export const BOSS_BODIES = {
  khan: {
    hurtShape: [10, 33, 18, 33],
    reach: { swipe: [2, -29, 42, 29], slam: [0, -28, 27, 28] },
  },
  colossus: COLOSSUS,
  // his punch lands at his own chest height, over a standing hero: it swats jumpers
  guardian: {
    hurtShape: [16, 43, 33, 43],
    reach: { swipe: [4, -33, 37, 15], slam: [0, -30, 25, 30], charge: [2, -38, 20, 34] },
  },
  ironhorn: {
    hurtShape: [11, 31, 20, 31],
    reach: { swipe: [2, -36, 36, 36], slam: [0, -44, 37, 44] },
  },
  cobra: {
    ...SERPENT,
    reach: { swipe: [2, -51, 40, 50], slam: [0, -30, 26, 30] },
  },
  // her own sheet, drawn half as fine again: her coil and the fan of hoods round her trunk
  naga: {
    hurtShape: [10, 41, 21, 41],
    reach: { swipe: [5, -39, 26, 39], slam: [0, -24, 18, 24] },
  },
  // her humanoid body stands over her feet and her scorpion's body runs back from them
  queen: {
    hurtShape: [10, 40, 27, 40],
    reach: { swipe: [2, -22, 38, 22], slam: [0, -32, 31, 32] },
  },
  gnoll: {
    hurtShape: [12, 36, 24, 36],
    reach: { swipe: [2, -34, 30, 34], slam: [0, -30, 26, 30] },
  },
  djinn: {
    hurtShape: [7, 39, 14, 39],
    reach: { swipe: [2, -36, 42, 36], slam: [0, -31, 24, 31] },
  },
  furnace: {
    hurtShape: [10, 40, 21, 40],
    reach: { swipe: [2, -36, 32, 36], slam: [0, -38, 49, 38] },
  },
  pharaoh: {
    hurtShape: [9, 37, 15, 37],
    reach: { swipe: [2, -44, 42, 44], slam: [0, -46, 24, 46] },
  },
  ox: {
    hurtShape: [12, 45, 26, 45],
    reach: { swipe: [2, -44, 37, 44], slam: [0, -40, 35, 40], charge: [2, -44, 26, 42] },
  },
};
