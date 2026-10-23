// The Bayon Guardian is a colossus: he stomps at the hero and never steps back, the road shaking
// under each step. Up close he pounds the ground, and his punch, thrown at his own chest height,
// swats a hero out of the air. His Stone Gaze marks the ground under the hero and a gold pillar
// bursts up there, turning whoever stands in it slow as stone; his Fig Roots burst along the floor
// at the hero, then under where the hero stands. Below 40% four giant stone faces rise at the
// screen's edges in turn and breathe gold across the arena: jump each beam, or stand past its
// reach. At half health he crumbles to rubble and reforms glowing, quicker, his gaze raising three
// pillars and his roots running both ways
export const GUARDIAN_KIT = {
  movement: 'colossus',
  close: { range: 48, moves: ['slam'] },
  skills: [
    { move: 'swipe', range: [0, 84], chance: 0.25, cooldown: 70, airborne: true },
    { move: 'stoneGaze', range: [70, 400], chance: 0.03, cooldown: 330 },
    { move: 'figRoots', range: [40, 300], chance: 0.035, cooldown: 360 },
  ],
  ultimate: { move: 'fourFaces', below: 0.4, every: 1500 },
  phaseTwo: {
    below: 0.5,
    pace: 1.3,
    cooldown: 0.65,
    swaps: { stoneGaze: 'stoneGlare', figRoots: 'figThicket' },
    opener: 'crumble',
  },
};
