import { defineMove } from '../../moves/define-move.js';

// the flail sweeps the floor ahead (jump it) and sets it alight at `blaze.at`, for `blaze.life`
const fireFlail = (life) => ({
  name: 'Fire Flail',
  frames: [44, 8, 34],
  damage: 14,
  hitbox: [0, -16, 60, 16],
  knockback: [3, -3.4],
  knockdown: true,
  strip: 'fireFlail',
  blaze: { at: [20, 46, 72], life },
  frameAt: [0, 8, 16, 24, 34, 40, 44, 56, 66, 76],
});

// the Furnace Knight's own moves, each on the timeline of its strip (frameAt: the tick each frame
// starts on; loopFrames: the frames he loops while the furnace fires or cools). The Meltdown strip
// braces and opens the furnace (0-3), fires (4), blazes between lances (5), stops (6), glows red
// hot (7), cools (8) and is back on guard (9)
export const FURNACE_MOVES = {
  fireFlail: defineMove(fireFlail(240)),
  fireFlailHot: defineMove(fireFlail(420)),
  // he lobs a pot of molten slag onto the spot the hero stands on; it breaks into a lava pool
  slagPot: defineMove({
    name: 'Slag Pot',
    frames: [40, 6, 30],
    damage: 0,
    hitbox: null,
    slagPot: true,
    frameAt: [0, 8, 18, 28, 40, 46, 58, 68],
  }),
  // the chest furnace opens and looses a flame lance down the arena at each of `lances` (jump
  // each), then he overheats the moment the last has gone, so no hit can knock him out of it first
  meltdown: defineMove({
    name: 'Meltdown',
    frames: [72, 150, 1],
    damage: 0,
    hitbox: null,
    armor: true,
    bossUltimate: true,
    lane: 384,
    lances: [72, 122, 172],
    loopFrames: [4, 5, 25],
    then: 'overheated',
    frameAt: [0, 8, 18, 30, 72, 97, 219, 220, 221, 222],
  }),
  // red hot and venting steam, his armor is off: every hit lands, for double damage
  overheated: defineMove({
    name: 'Overheated',
    frames: [0, 180, 1],
    damage: 0,
    hitbox: null,
    quiet: true,
    exposed: true,
    vents: 30,
    strip: 'meltdown',
    loopFrames: [7, 8, 20],
    frameAt: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }),
};
