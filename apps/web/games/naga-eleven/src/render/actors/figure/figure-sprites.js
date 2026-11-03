import { DIRECTIONS } from '../directions.js';

const ROWS = {
  south: 0,
  'south-east': 1,
  east: 2,
  'north-east': 3,
  north: 4,
  'north-west': { mirrorOf: 'north-east' },
  west: { mirrorOf: 'east' },
  'south-west': { mirrorOf: 'south-east' },
};

const YAWS = { south: 90, 'south-east': 45, east: 0, 'north-east': -45, north: -90 };

// The block figure's frames, in the same shape as the sprites' manifest (src/data/sprites.js), so
// both are drawn the one way. Its dive faces the camera and flies to its right, the screen's left,
// where the sheets' dive flies forward. The camera looks down on it, so the near foot stands a
// pixel or two under the anchor, and a body lying toward the camera reaches well under it
export const FIGURE_SPRITES = {
  frame: { width: 72, height: 92 },
  anchor: { x: 36, y: 70 },
  standHeight: 58,
  directions: DIRECTIONS,
  animations: {
    idle: { frames: 2, fps: 2, rows: ROWS },
    run: { frames: 6, fps: 12, rows: ROWS },
    kick: { frames: 4, fps: 15, rows: ROWS },
    slide: { frames: 2, fps: 5, rows: ROWS },
    fall: { frames: 3, fps: 8, rows: ROWS },
    dive: {
      frames: 3,
      fps: 10,
      rows: { 'south-west': 0, 'south-east': { mirrorOf: 'south-west' } },
    },
    celebrate: { frames: 4, fps: 8, rows: ROWS },
  },
};

export const yawOf = (animation, direction) => (animation === 'dive' ? 90 : YAWS[direction]);

export const drawnDirections = (animation) =>
  Object.entries(FIGURE_SPRITES.animations[animation].rows)
    .filter(([, row]) => typeof row === 'number')
    .map(([direction, row]) => ({ direction, row }));
