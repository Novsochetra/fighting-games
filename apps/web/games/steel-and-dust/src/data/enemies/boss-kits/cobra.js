// The Cobra Matriarch keeps the middle distance: she slithers back from a hero who crowds her and
// spits venom that leaves poison puddles, and lashes her tail along the floor at one who stands a
// little off (jump it). Below 40% her hood flares in a Hypnotic Gaze: a hero facing her when her
// eyes flash is held still for her lunge. Below half health she spits five globs and the puddles
// last longer
export const COBRA_KIT = {
  movement: 'slither',
  close: { range: 46, moves: ['swipe', 'slam'] },
  skills: [
    { move: 'coilLash', range: [40, 120], chance: 0.08, cooldown: 180 },
    { move: 'venomSpit', range: [100, 400], chance: 0.05, cooldown: 260 },
  ],
  ultimate: { move: 'hypnoticGaze', below: 0.4, every: 1500 },
  phaseTwo: {
    below: 0.5,
    pace: 1.2,
    cooldown: 0.7,
    swaps: { venomSpit: 'venomSpray' },
  },
};
