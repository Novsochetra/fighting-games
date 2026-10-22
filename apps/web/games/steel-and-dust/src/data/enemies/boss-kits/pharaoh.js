// The Sand Pharaoh is an illusionist: he glides at the middle distance and, crowded, dissolves into
// gold sand and steps out at the far end of the arena. His Mirage Clones cast two copies of him that
// move as he moves, one hit popping a copy; his Scarab Carpet sends a crawling wave of scarabs along
// the floor. Below 40% the Curse of the Sun marks the hero with the sun's eye: break the three
// canopic jars round the arena in time or it burns them, and break them all and the broken sun
// leaves him reeling. Below half health his copies fire mirage bolts of their own
export const PHARAOH_KIT = {
  movement: 'illusionist',
  close: { range: 44, moves: ['swipe', 'slam'] },
  skills: [
    { move: 'mirageClones', range: [40, 400], chance: 0.02, cooldown: 720, noMirages: true },
    { move: 'scarabCarpet', range: [70, 360], chance: 0.035, cooldown: 300 },
  ],
  ultimate: { move: 'curseOfSun', below: 0.4, every: 1500 },
  phaseTwo: {
    below: 0.5,
    pace: 1.2,
    cooldown: 0.7,
    swaps: { mirageClones: 'mirageVolley' },
  },
};
