import { defineMove } from '../../moves/define-move.js';

const LUNGE_LOOP = [4, 7, 5];
// a lunge that carries on from the one before starts on frame 6, the club raised again
const CARRIES_ON = [0, 0, 0, 0, 0, 0, 0, 150, 150, 150, 150, 150];

// he howls at the sky (frame 5 held) and the pack comes running from both sides
const packCall = (count) => ({
  name: 'Pack Call',
  frames: [24, 60, 16],
  damage: 0,
  hitbox: null,
  armor: true,
  strip: 'packCall',
  pack: count,
  packKind: 'hound',
  howls: [24, 40, 56, 72],
  frameAt: [0, 6, 12, 18, 24, 32, 84, 92],
});

// one lunge of the frenzy: it runs to the arena's wall and `wallNext` names the next, faster each
// time; every hit that lands feeds him
const lunge = ({ startup, forward, next, frameAt }) => ({
  name: 'Blood Frenzy',
  frames: [startup, 140, 10],
  damage: 8,
  hitbox: [0, -55, 44, 55],
  knockback: [3.2, -2.6],
  sustain: true,
  forward,
  lane: 384,
  strip: 'bloodFrenzy',
  bossUltimate: true,
  armor: true,
  afterimages: true,
  ghost: 'frenzyGhost',
  heals: 6,
  eyeTrail: true,
  loopFrames: LUNGE_LOOP,
  wallNext: { move: next, turn: true, soft: true },
  frameAt,
});

const carryOn = (forward, next) =>
  defineMove({ continues: true, ...lunge({ startup: 12, forward, next, frameAt: CARRIES_ON }) });

// the Gnoll Packlord's own moves, each on the timeline of its strip (frameAt: the tick each frame
// starts on; loopFrames: the frames a lunge or his panting loops through while it lasts)
export const GNOLL_MOVES = {
  packCall: defineMove(packCall(2)),
  packCallThree: defineMove(packCall(3)),
  leapingMaul: defineMove({
    name: 'Leaping Maul',
    frames: [54, 8, 30],
    damage: 15,
    hitbox: [-12, -32, 38, 32],
    knockback: [3, -3.6],
    knockdown: true,
    shockwave: true,
    bones: true,
    leapAt: 18,
    frameAt: [0, 6, 12, 18, 26, 34, 44, 54, 66, 76],
  }),
  bloodFrenzy: defineMove(
    lunge({
      startup: 72,
      forward: 5.2,
      next: 'frenzy2',
      frameAt: [0, 8, 16, 26, 210, 210, 210, 210, 210, 210, 210, 210],
    }),
  ),
  frenzy2: carryOn(5.6, 'frenzy3'),
  frenzy3: carryOn(6, 'frenzy4'),
  frenzy4: carryOn(6.4, 'frenzy5'),
  frenzy5: carryOn(6.8, 'frenzyPant'),
  // he turns from the wall and staggers a step back into the arena, then stands there panting
  frenzyPant: defineMove({
    name: 'Panting',
    frames: [0, 100, 1],
    damage: 0,
    hitbox: null,
    quiet: true,
    forward: 4,
    strip: 'bloodFrenzy',
    loopFrames: [10, 11, 18],
    frameAt: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }),
};
