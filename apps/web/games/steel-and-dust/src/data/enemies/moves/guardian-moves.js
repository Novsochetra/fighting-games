import { defineMove } from '../../moves/define-move.js';

// the gaze strip: the eyes kindle (2-3), flare (4) and fade; the ground under the hero is marked
// at `lockAt` and the pillars burst there as the eyes flare
const stoneGaze = (name, spots) =>
  defineMove({
    name,
    frames: [36, 14, 30],
    damage: 0,
    hitbox: null,
    strip: 'stoneGaze',
    gaze: { lockAt: 8, spots },
    frameAt: [0, 8, 16, 26, 36, 50, 60, 70],
  });

// the roots strip drives both fists into the ground (1-3); the roots burst round him (4-5)
const figRoots = (name, bothWays) =>
  defineMove({
    name,
    frames: [26, 30, 22],
    damage: 0,
    hitbox: null,
    strip: 'figRoots',
    lane: 'roots',
    laneBothWays: bothWays,
    roots: { count: 5, gap: 30, every: 6, bothWays, underHero: 40 },
    frameAt: [0, 8, 16, 26, 34, 44, 56, 66],
  });

const CRUMBLE_FRAMES = [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0];

// the Bayon Guardian's own moves, each on the timeline of its strip (frameAt: the tick each step
// starts on; frameOrder: the strip's frame each step shows, where a strip plays back on itself)
export const GUARDIAN_MOVES = {
  stoneGaze: stoneGaze('Stone Gaze', [0]),
  stoneGlare: stoneGaze('Stone Gaze', [-64, 0, 64]),
  figRoots: figRoots('Fig Roots', false),
  figThicket: figRoots('Fig Roots', true),
  // he raises his arms and glows gold (0-5), holds it while four faces rise at the screen's edges
  // and breathe gold across the arena, then prays, spent (6), and stands (9-11)
  fourFaces: defineMove({
    name: 'Four Faces',
    frames: [60, 300, 110],
    damage: 0,
    hitbox: null,
    armor: true,
    bossUltimate: true,
    faces: [
      { at: 60, side: -1 },
      { at: 130, side: 1 },
      { at: 200, side: -1 },
      { at: 260, side: 1 },
    ],
    loopFrames: [4, 5, 12],
    // frame 2's raised hand was drawn hidden behind the next frame's, so frame 1 holds in its place;
    // frames 7-8 were drawn smaller and turned to the viewer, so frame 6's prayer holds instead
    frameOrder: [0, 1, 1, 3, 4, 5, 6, 6, 6, 9, 10, 11],
    frameAt: [0, 8, 16, 28, 40, 52, 360, 376, 392, 420, 440, 456],
  }),
  // at half health he falls to rubble, out of reach while only rubble is left, and builds himself
  // back up glowing
  crumble: defineMove({
    name: 'Crumble',
    frames: [44, 56, 50],
    damage: 0,
    hitbox: null,
    quiet: true,
    armor: true,
    vanish: [36, 108],
    collapseAt: 30,
    reformAt: 100,
    frameOrder: CRUMBLE_FRAMES,
    frameAt: [0, 6, 12, 18, 24, 30, 36, 42, 100, 106, 112, 118, 124, 130, 138],
  }),
};
