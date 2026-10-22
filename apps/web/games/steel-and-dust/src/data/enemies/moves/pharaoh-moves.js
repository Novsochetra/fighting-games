import { defineMove } from '../../moves/define-move.js';

// the mirage strip raises the staff (0-2), dissolves into gold sand (3-5), steps out of it crouched
// (6) and stands (7-8); out of reach while only sand is left (`vanish`)
const mirageClones = (firing) => ({
  name: 'Mirage Clones',
  frames: [44, 1, 26],
  damage: 0,
  hitbox: null,
  strip: 'mirage',
  mirages: { count: 2, firing },
  vanish: [32, 44],
  frameAt: [0, 8, 16, 26, 32, 38, 44, 54, 62],
});

// the Sand Pharaoh's own moves, each on the timeline of its strip (frameAt: the tick each frame
// starts on; loopFrames: the frames he loops while the sun burns over him)
export const PHARAOH_MOVES = {
  mirageClones: defineMove(mirageClones(false)),
  mirageVolley: defineMove(mirageClones(true)),
  // only the dissolving and stepping out: he leaves in sand and comes out at the far end
  mirageBlink: defineMove({
    name: 'Mirage Step',
    frames: [18, 1, 22],
    damage: 0,
    hitbox: null,
    quiet: true,
    strip: 'mirage',
    blink: true,
    vanish: [6, 18],
    frameAt: [0, 0, 0, 0, 6, 12, 18, 26, 34],
  }),
  // the staff thrust low pours a carpet of scarabs along the floor at the hero: jump it
  scarabCarpet: defineMove({
    name: 'Scarab Carpet',
    frames: [30, 26, 14],
    damage: 0,
    hitbox: null,
    lane: 300,
    scarabs: true,
    frameAt: [0, 8, 18, 28, 36, 44, 52, 64],
  }),
  // the sun rises over his staff and marks the hero with its eye; three canopic jars stand round
  // the arena until `releaseAt`, when the curse burns the hero if any jar still stands
  curseOfSun: defineMove({
    name: 'Curse of the Sun',
    frames: [72, 360, 50],
    damage: 0,
    hitbox: null,
    armor: true,
    bossUltimate: true,
    curse: { jars: 3, releaseAt: 440 },
    loopFrames: [4, 7, 8],
    frameAt: [0, 12, 28, 48, 72, 80, 88, 96, 432, 440, 448, 470],
  }),
  // every jar broken, the sun bursts over him and leaves him reeling
  sunBroken: defineMove({
    name: 'Sun Broken',
    frames: [0, 150, 12],
    damage: 0,
    hitbox: null,
    quiet: true,
    strip: 'hurt',
    loopFrames: [1, 2, 10],
    stars: { every: 16, up: 44 },
    frameAt: [0, 4, 8, 12],
  }),
};
