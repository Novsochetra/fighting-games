// the Rust Colossus is a bulldozer: he walks at the hero and never steps back; from range he lobs a
// boulder at where the hero stands, nearer he stomps a line of stone spikes up the road, and below
// 40% he pounds the ground and roars while boulders fall on marked spots. Below half health his
// spike line runs both ways
export const COLOSSUS_KIT = {
  movement: 'bulldozer',
  close: { range: 44, moves: ['swipe', 'slam'] },
  skills: [
    { move: 'spikeLine', range: [50, 200], chance: 0.04, cooldown: 360 },
    { move: 'boulderLob', range: [110, 400], chance: 0.03, cooldown: 300 },
  ],
  ultimate: { move: 'landslide', below: 0.4, every: 1500 },
  phaseTwo: {
    below: 0.5,
    pace: 1.3,
    cooldown: 0.7,
    swaps: { spikeLine: 'spikeCross' },
  },
};
