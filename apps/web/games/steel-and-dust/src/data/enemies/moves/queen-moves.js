import { defineMove } from '../../moves/define-move.js';

const DIG = [0, 5, 10, 16, 22, 28, 34, 40];
const MOUND_LOOP = [8, 11, 5];

// she digs in (frames 0-7), then her mound (8-11) tunnels after the hero; out of reach from the
// moment only her head shows until she bursts up again, and `then` names the move she surfaces in
const burrow = ({ active, tunnel, rumbles }) => ({
  name: 'Burrow Ambush',
  frames: [44, active, 1],
  damage: 0,
  hitbox: null,
  strip: 'burrow',
  underground: [22, 44 + active + 1],
  tunnel,
  rumbles,
  loopFrames: MOUND_LOOP,
  frameAt: [...DIG, 44, 49, 54, 59],
  then: 'emerge',
});

// each wasp of the swarm: [ticks into the swarm, from her side or the far side, flying low (jump
// it) or high (stay down)]; the far wave waits for the near one to pass, so no two ever cross
const SWARM = [
  [0, 'near', 'low'],
  [48, 'near', 'high'],
  [96, 'near', 'low'],
  [232, 'far', 'high'],
  [280, 'far', 'low'],
  [328, 'far', 'low'],
];

// the Scorpion Queen's own moves, each on the timeline of its strip (frameAt: the tick each frame
// starts on; loopFrames: the frames a tunnel or a summoning loops through while it lasts)
export const QUEEN_MOVES = {
  burrow: defineMove(burrow({ active: 110, tunnel: [[44, 132]], rumbles: [] })),
  burrowTwice: defineMove(
    burrow({
      active: 200,
      tunnel: [
        [44, 120],
        [150, 222],
      ],
      rumbles: [120],
    }),
  ),
  emerge: defineMove({
    name: 'Burrow Ambush',
    frames: [26, 8, 34],
    damage: 16,
    hitbox: [-22, -60, 44, 60],
    knockback: [1.6, -6.4],
    launch: true,
    knockdown: true,
    armor: true,
    erupts: true,
    frameAt: [0, 6, 12, 18, 26, 34, 46, 56],
  }),
  tailSting: defineMove({
    name: 'Tail Sting',
    frames: [30, 8, 26],
    damage: 10,
    hitbox: [16, -34, 28, 26],
    knockback: [2.2, -1],
    poison: { ticks: 180, every: 30, damage: 2 },
    frameAt: [0, 6, 12, 20, 30, 34, 38, 46, 54],
  }),
  hiveSwarm: defineMove({
    name: 'Hive Swarm',
    frames: [60, 330, 44],
    damage: 0,
    hitbox: null,
    armor: true,
    bossUltimate: true,
    swarm: { from: 60, wasps: SWARM },
    slamAt: 390,
    loopFrames: [5, 7, 6],
    frameAt: [0, 8, 16, 26, 36, 60, 66, 72, 390, 400, 412, 424],
  }),
};
