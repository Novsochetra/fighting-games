import { defineMove } from '../../moves/define-move.js';

// each wave of the storm: [the tick its spots are marked on, where they fall from the hero]; the
// first and last aim at the hero and the middle one leaves the hero's own spot clear, so a hero who
// ran from the first is caught by the second
const STORM_WAVES = [
  [84, [-64, 0, 64]],
  [150, [-96, -32, 32, 96]],
  [216, [-128, -64, 0, 64, 128]],
];

const dustDevil = (devils) => ({
  name: 'Dust Devil',
  frames: [34, 6, 30],
  damage: 0,
  hitbox: null,
  strip: 'dustDevil',
  devils,
  frameAt: [0, 8, 16, 26, 34, 40, 54, 64],
});

// the Storm Djinn's own moves, each on the timeline of its strip (frameAt: the tick each frame
// starts on; loopFrames: the frames he loops while the storm lasts)
export const DJINN_MOVES = {
  // the punch strikes nothing itself: the bolt it looses runs along the floor (jump it)
  thunderFist: defineMove({
    name: 'Thunder Fist',
    frames: [36, 6, 34],
    damage: 0,
    hitbox: null,
    lane: 300,
    thunderBolt: true,
    frameAt: [0, 8, 18, 36, 42, 50, 60, 70],
  }),
  dustDevil: defineMove(dustDevil(1)),
  dustDevils: defineMove(dustDevil(2)),
  eyeOfStorm: defineMove({
    name: 'Eye of the Storm',
    frames: [80, 300, 70],
    damage: 0,
    hitbox: null,
    armor: true,
    bossUltimate: true,
    storm: { waves: STORM_WAVES, bigAt: 290 },
    loopFrames: [6, 8, 6],
    frameAt: [0, 8, 16, 26, 36, 46, 80, 86, 92, 380, 400, 420],
  }),
};
