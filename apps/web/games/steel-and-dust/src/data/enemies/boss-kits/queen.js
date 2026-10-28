// The Scorpion Queen scuttles to and fro at the edge of her tail's reach and stabs over her own head
// with a sting that poisons; a hero who keeps away sees her dig in, and her mound tunnels after
// them until she bursts up underneath. Below 40% she shrieks up a Hive Swarm, waves of hive wasps
// skimming the road low or flying high across the screen. Below half health she goes under a
// second time before she surfaces
export const QUEEN_KIT = {
  movement: 'scuttle',
  close: { range: 44, moves: ['swipe', 'slam'] },
  skills: [
    { move: 'tailSting', range: [36, 96], chance: 0.08, cooldown: 170 },
    { move: 'burrow', range: [110, 400], chance: 0.04, cooldown: 420 },
  ],
  ultimate: { move: 'hiveSwarm', below: 0.4, every: 1500 },
  phaseTwo: {
    below: 0.5,
    pace: 1.25,
    cooldown: 0.7,
    swaps: { burrow: 'burrowTwice' },
  },
};
