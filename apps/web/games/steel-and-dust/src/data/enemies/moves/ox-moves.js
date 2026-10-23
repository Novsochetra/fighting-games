import { defineMove } from '../../moves/define-move.js';

// he throws the hook at the strike and holds his arm out while it flies (frame 3); a hook that
// misses comes back and he coils the chain (5) and stands down (8). The lane runs as far as the
// hook can reach from his fist (chain-hook.js)
const chainHook = (chop) => ({
  name: 'Chain Hook',
  frames: [30, 90, 24],
  damage: 0,
  hitbox: null,
  strip: 'chainHook',
  lane: 260,
  hook: { chop },
  frameAt: [0, 8, 18, 30, 120, 120, 132, 132, 132],
});

// a hooked hero is dragged in (4, 5), let go as he raises the hammer (6) and chopped (7)
const CHOP = {
  name: 'Chain Hook',
  damage: 18,
  hitbox: [4, -26, 24, 26],
  knockback: [4.4, -3.2],
  knockdown: true,
  armor: true,
  strip: 'chainHook',
  letGoAt: 16,
  frameAt: [0, 0, 0, 0, 0, 8, 16, 30, 44],
};

// the spin strikes from his feet to the whirl ahead of him as he spins on (frames 4-6 swing the hammer
// 38 of his units ahead); what trails behind has passed, so a hero who dashes through him in time
// is clear
const SPIN = {
  damage: 14,
  hitbox: [0, -40, 38, 40],
  knockback: [4, -3],
  knockdown: true,
  armor: true,
  sustain: true,
  forward: 5,
  whirl: true,
  lane: 384,
  strip: 'execution',
  loopFrames: [4, 6, 4],
};

// the Warden Ox's own moves, each on the timeline of its strip (frameAt: the tick each frame
// starts on; loopFrames: the frames he loops while a guard or a spin lasts)
export const OX_MOVES = {
  chainHook: defineMove(chainHook('hookChop')),
  chainHookTwice: defineMove(chainHook('hookChopTwice')),
  hookChop: defineMove({ ...CHOP, frames: [30, 4, 26] }),
  // below half health the first chop only staggers, and a second follows before the hero recovers
  hookChopTwice: defineMove({
    ...CHOP,
    frames: [30, 4, 6],
    damage: 12,
    knockback: [1.2, -1],
    knockdown: false,
    hitstun: 40,
    then: 'hookChopAgain',
  }),
  hookChopAgain: defineMove({
    ...CHOP,
    frames: [14, 4, 24],
    damage: 16,
    quiet: true,
    letGoAt: null,
    frameAt: [0, 0, 0, 0, 0, 0, 0, 14, 28],
  }),
  // he raises his guard (1-2) and holds it (2-3); a blow that lands on it is parried, and he
  // counters at once (guard-counter.js); left alone, he lowers it (6-7)
  guardCounter: defineMove({
    name: 'Guard Counter',
    frames: [14, 96, 20],
    damage: 0,
    hitbox: null,
    strip: 'guardCounter',
    guard: { glintAt: 14 },
    loopFrames: [2, 3, 8],
    frameAt: [0, 6, 14, 22, 110, 110, 110, 120],
  }),
  guardStrike: defineMove({
    name: 'Counter',
    frames: [8, 6, 34],
    damage: 20,
    hitbox: [4, -28, 46, 24],
    knockback: [5, -3.4],
    knockdown: true,
    armor: true,
    forward: 2.4,
    quiet: true,
    strip: 'guardCounter',
    frameAt: [0, 0, 0, 0, 8, 20, 30, 40],
  }),
  // he raises the hammer overhead (1-2) and spins across the arena to its wall (4-6), and back
  executionersRound: defineMove({
    name: "Executioner's Round",
    frames: [66, 200, 0],
    bossUltimate: true,
    ...SPIN,
    wallNext: { move: 'roundBack', turn: true, soft: true },
    frameAt: [0, 8, 18, 56, 66, 66, 66, 265, 265, 265, 265, 265],
  }),
  roundBack: defineMove({
    name: "Executioner's Round",
    frames: [8, 200, 0],
    continues: true,
    ...SPIN,
    wallNext: { move: 'roundCleave', turn: true, soft: true },
    frameAt: [0, 0, 0, 0, 8, 8, 8, 207, 207, 207, 207, 207],
  }),
  // then he leaps at the hero (8) and cleaves the ground (9), splitting it both ways in red, and
  // stands with the hammer driven into the road (10) before he wrenches it free (11)
  roundCleave: defineMove({
    name: "Executioner's Round",
    frames: [40, 4, 66],
    continues: true,
    damage: 20,
    hitbox: [0, -22, 28, 22],
    knockback: [3, -4.5],
    knockdown: true,
    armor: true,
    leapAt: 10,
    cleave: true,
    strip: 'execution',
    frameAt: [0, 0, 0, 0, 0, 0, 0, 0, 10, 40, 46, 100],
  }),
};
