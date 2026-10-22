import { defineMove } from '../../moves/define-move.js';

// her spit, three globs at the strike (five below half health), each leaving a puddle that lasts
// `puddle` ticks where it lands
const spit = (globs) => ({
  frames: [24, 8, 24],
  damage: 0,
  hitbox: null,
  strip: 'venomSpit',
  globs,
  frameAt: [0, 6, 14, 24, 28, 32, 40, 48],
});

// The Cobra Matriarch's own moves, each on the timeline of its strip (frameAt: the tick each frame
// starts on)
export const COBRA_MOVES = {
  venomSpit: defineMove({ name: 'Venom Spit', ...spit({ count: 3, gap: 26, puddle: 240 }) }),
  venomSpray: defineMove({ name: 'Venom Spit', ...spit({ count: 5, gap: 22, puddle: 360 }) }),
  coilLash: defineMove({
    name: 'Coil Lash',
    frames: [30, 8, 26],
    damage: 13,
    hitbox: [6, -8, 40, 8],
    knockback: [2.4, -3.2],
    knockdown: true,
    lane: 60,
    frameAt: [0, 5, 10, 16, 22, 27, 30, 38, 48, 58],
  }),
  // the hood flares and her eyes glow from warnAt; at flashAt a hero facing her within reach is
  // held for `stun` ticks, then she lunges
  hypnoticGaze: defineMove({
    name: 'Hypnotic Gaze',
    frames: [116, 22, 28],
    damage: 18,
    hitbox: [8, -32, 22, 24],
    knockback: [4, -3.4],
    knockdown: true,
    sustain: true,
    forward: 6,
    stopOnHit: true,
    lane: 140,
    bossUltimate: true,
    armor: true,
    gaze: { warnAt: 34, flashAt: 96, stun: 80, reach: 260 },
    frameAt: [0, 8, 16, 24, 34, 44, 54, 96, 104, 116, 138, 152],
  }),
};
