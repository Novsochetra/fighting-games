import { defineMove } from '../../moves/define-move.js';

// her Tidal Coil: she rears up on her coil (0-3) and crashes down (5), and a wave of moat water
// rolls along the floor from her coil at each of `tides` (jump it)
const tidalCoil = (tides, recovery) => ({
  name: 'Tidal Coil',
  frames: [40, 8, recovery],
  damage: 0,
  hitbox: null,
  lane: 300,
  strip: 'tidalCoil',
  splash: true,
  tides,
  frameAt: [0, 8, 16, 26, 34, 40, 50, 62, 72],
});

// the Seven Heads' strikes: [the tick a head spits its water naga, which of the five striking
// heads (top to bottom), the lane it flies in]. Low ones come in pairs a jump can clear, high ones
// fly over a standing hero, and a high pair comes long enough after a jump for the hero to have
// landed
const SEVEN_HEADS = [
  [36, 4, 'low'],
  [54, 3, 'low'],
  [100, 1, 'high'],
  [118, 0, 'high'],
  [164, 4, 'low'],
  [182, 2, 'low'],
  [228, 0, 'high'],
];

// the Naga Raja's own moves, each on the timeline of its strip (frameAt: the tick each frame
// starts on; loopFrames: the frames she holds while the spirits sweep)
export const NAGA_MOVES = {
  // the slash the swipe strip draws, its reach matched to the arc of its strike frame
  serpentSlash: defineMove({
    name: 'Serpent Slash',
    frames: [22, 4, 24],
    damage: 11,
    hitbox: [5, -39, 26, 39],
    knockback: [3.5, -1.5],
    strip: 'attack',
  }),
  // she rises on her coil and brings it down where she stands, in a burst of moat water
  tailSlam: defineMove({
    name: 'Tail Slam',
    frames: [34, 6, 30],
    damage: 15,
    hitbox: [0, -24, 18, 24],
    knockback: [3, -4],
    knockdown: true,
    strip: 'slam',
    splash: true,
    frameAt: [0, 6, 12, 20, 28, 34, 44, 54, 62],
  }),
  tidalCoil: defineMove(tidalCoil([40], 40)),
  tidalCoils: defineMove(tidalCoil([40, 80], 56)),
  // her hoods rise and fan, then strike forward again and again (frames 4 and 5, in turn), each
  // strike spitting a water naga, low or high
  sevenHeads: defineMove({
    name: 'Seven Heads',
    frames: [36, 210, 24],
    damage: 0,
    hitbox: null,
    heads: SEVEN_HEADS,
    loopFrames: [4, 5, 18],
    frameAt: [0, 8, 18, 28, 36, 54, 246, 258],
  }),
  // the rainbow gathers into an orb over the hand she raises (frames 1-2) and bursts as she rises
  // with both arms up (3); holding the summoning (4-7), she sends a spirit naga sweeping the floor
  // from behind her, another from behind the hero, then a serpent of water bursts up on the spot
  // marked under the hero; she points her dagger (8) and sags, spent (9)
  rainbowNaga: defineMove({
    name: 'Rainbow Naga',
    frames: [64, 296, 40],
    damage: 0,
    hitbox: null,
    armor: true,
    bossUltimate: true,
    calloutUp: 75,
    rainbow: {
      orbAt: 8,
      burstAt: 52,
      sweeps: [
        [70, 'near'],
        [170, 'far'],
      ],
      riseAt: 270,
    },
    loopFrames: [4, 7, 12],
    then: 'nagaSpent',
    frameAt: [0, 8, 30, 52, 64, 76, 88, 100, 360, 372, 384, 392],
  }),
  // the summoning spent, she sags on her coil, open to every blow
  nagaSpent: defineMove({
    name: 'Spent',
    frames: [0, 150, 12],
    damage: 0,
    hitbox: null,
    quiet: true,
    strip: 'hurt',
    loopFrames: [2, 3, 14],
    stars: { every: 16, up: 57 },
    frameAt: [0, 4, 8, 12],
  }),
};
