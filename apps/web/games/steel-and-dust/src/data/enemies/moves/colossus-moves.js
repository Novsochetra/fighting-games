import { defineMove } from '../../moves/define-move.js';

const SPIKE_LINE_FRAMES = [0, 8, 16, 28, 34, 40, 56, 64];

const spikeLine = (bothWays) =>
  defineMove({
    name: 'Spike Line',
    frames: [34, 12, 26],
    damage: 0,
    hitbox: null,
    strip: 'spikeLine',
    lane: 'spikes',
    laneBothWays: bothWays,
    spikes: { count: 6, gap: 22, every: 5, bothWays },
    frameAt: SPIKE_LINE_FRAMES,
  });

// the Rust Colossus's own moves, each on the timeline of its strip (frameAt: the tick each frame
// starts on); the second spike line, below half health, runs both ways off the one strip
export const COLOSSUS_MOVES = {
  boulderLob: defineMove({
    name: 'Boulder Lob',
    frames: [48, 6, 22],
    damage: 0,
    hitbox: null,
    boulder: true,
    frameAt: [0, 6, 12, 20, 28, 36, 48, 54, 62, 70],
  }),
  spikeLine: spikeLine(false),
  spikeCross: spikeLine(true),
  landslide: defineMove({
    name: 'Landslide',
    frames: [66, 210, 30],
    damage: 0,
    hitbox: null,
    armor: true,
    bossUltimate: true,
    quakes: [16, 38],
    rockfall: { count: 9, every: 24 },
    frameAt: [0, 8, 16, 20, 30, 38, 42, 52, 58, 66, 276, 288],
  }),
};
