import { defineMove } from '../../moves/define-move.js';

const RUN_LOOP = [6, 9, 3];

// a rush down the whole screen: it runs until it meets the arena's wall, and `wallNext` names the
// move it turns into there
const rush = ({ startup, forward, wallNext, frameAt }) => ({
  frames: [startup, 120, 16],
  damage: 16,
  hitbox: [0, -34, 30, 30],
  knockback: [4.4, -3.4],
  knockdown: true,
  sustain: true,
  forward,
  lane: 384,
  strip: 'stampede',
  bossUltimate: true,
  armor: true,
  loopFrames: RUN_LOOP,
  wallNext,
  frameAt,
});

const dazed = (ticks) =>
  defineMove({
    name: 'Dazed',
    frames: [0, ticks, 1],
    damage: 0,
    hitbox: null,
    quiet: true,
    strip: 'dazed',
    loopFrames: [0, 5, 6],
    stars: { every: 16, y: -38 },
    frameAt: [0, 6, 12, 18, 24, 30],
  });

// Ironhorn's own moves, each on the timeline of its strip (frameAt: the tick each frame starts on;
// loopFrames: the frames a run or a daze loops through while it lasts)
export const IRONHORN_MOVES = {
  hornRush: defineMove({
    name: 'Horn Rush',
    frames: [40, 110, 16],
    damage: 14,
    hitbox: [0, -34, 30, 30],
    knockback: [4.2, -3],
    knockdown: true,
    sustain: true,
    forward: 4.6,
    lane: 384,
    loopFrames: [4, 7, 4],
    wallNext: { move: 'dazed', onlyOnMiss: true },
    frameAt: [0, 8, 16, 24, 40, 44, 48, 52, 150, 158],
  }),
  uppercut: defineMove({
    name: 'Mace Uppercut',
    frames: [20, 6, 22],
    damage: 14,
    hitbox: [0, -72, 30, 58],
    knockback: [1.6, -6],
    launch: true,
    frameAt: [0, 5, 10, 16, 20, 26, 36, 44],
  }),
  dazed: dazed(110),
  dazedLong: dazed(150),
  stampede: defineMove({
    name: 'Stampede',
    ...rush({
      startup: 72,
      forward: 4.8,
      wallNext: { move: 'stampedeBack', turn: true },
      frameAt: [0, 8, 18, 30, 42, 54, 72, 75, 78, 81, 192, 200],
    }),
  }),
  stampedeBack: defineMove({
    name: 'Stampede',
    continues: true,
    ...rush({
      startup: 14,
      forward: 5.6,
      wallNext: { move: 'stampedeLast', turn: true },
      frameAt: [0, 0, 0, 0, 0, 0, 14, 17, 20, 23, 134, 142],
    }),
  }),
  stampedeLast: defineMove({
    name: 'Stampede',
    continues: true,
    ...rush({
      startup: 14,
      forward: 6.4,
      wallNext: { move: 'dazedLong' },
      frameAt: [0, 0, 0, 0, 0, 0, 14, 17, 20, 23, 134, 142],
    }),
  }),
};
