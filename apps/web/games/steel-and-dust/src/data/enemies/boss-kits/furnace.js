// The Furnace Knight is a juggernaut: he walks at the hero behind his guard, never backs off and
// vents steam as he comes. His Fire Flail sweeps the floor and leaves it burning, and his Slag Pot
// breaks into a lava pool where the hero stood. Below 40% the Meltdown opens his chest furnace on
// three flame lances down the arena; then he overheats, his armor off, taking double damage for
// 3 s. Below half health his burning ground lasts longer
export const FURNACE_KIT = {
  movement: 'juggernaut',
  close: { range: 46, moves: ['swipe', 'slam'] },
  skills: [
    { move: 'fireFlail', range: [30, 100], chance: 0.05, cooldown: 240 },
    { move: 'slagPot', range: [100, 360], chance: 0.03, cooldown: 360 },
  ],
  ultimate: { move: 'meltdown', below: 0.4, every: 1500 },
  phaseTwo: {
    below: 0.5,
    pace: 1.2,
    cooldown: 0.7,
    swaps: { fireFlail: 'fireFlailHot' },
  },
};
