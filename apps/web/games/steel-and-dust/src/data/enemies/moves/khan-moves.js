import { defineMove } from '../../moves/define-move.js';

// Gravel Khan's own moves. Each plays its own strip, and frameAt lists the tick each frame of that
// strip starts on, so a held pose lasts as long as the move needs it to.
export const KHAN_MOVES = {
  crescentDash: defineMove({
    name: 'Crescent Dash',
    frames: [36, 30, 24],
    damage: 14,
    hitbox: [0, -34, 30, 30],
    knockback: [4.2, -3],
    knockdown: true,
    sustain: true,
    forward: 5.2,
    lane: 160,
    glint: 18,
    frameAt: [0, 7, 14, 22, 36, 44, 52, 66, 74, 82],
  }),
  warHorn: defineMove({
    name: 'War Horn',
    frames: [24, 36, 18],
    damage: 0,
    hitbox: null,
    armor: true,
    horn: 2,
    frameAt: [0, 6, 12, 18, 24, 36, 48, 62],
  }),
  tempest: defineMove({
    name: "Khan's Tempest",
    frames: [72, 92, 14],
    damage: 0,
    hitbox: null,
    armor: true,
    bossUltimate: true,
    lane: 200,
    crescents: [80, 108, 136],
    frameAt: [0, 8, 16, 24, 72, 80, 100, 108, 126, 136, 152, 164],
  }),
};
