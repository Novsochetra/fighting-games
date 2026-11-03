const DRAWN_ROWS = { south: 0, 'south-east': 1, east: 2, 'north-east': 3, north: 4 };

const MIRRORED_ROWS = {
  'north-west': { mirrorOf: 'north-east' },
  west: { mirrorOf: 'east' },
  'south-west': { mirrorOf: 'south-east' },
};

// the footballer every player is drawn as, recoloured to each look from the shades in
// src/art/sprite-kit.js; he stands 58 px tall, soles on the anchor
export const SPRITES = {
  frame: { width: 64, height: 62 },
  anchor: { x: 32, y: 61 },
  directions: [
    'south',
    'south-east',
    'east',
    'north-east',
    'north',
    'north-west',
    'west',
    'south-west',
  ],
  animations: {
    idle: {
      image: 'assets/sprites/idle.png',
      frames: 1,
      fps: 1,
      rows: {
        south: 0,
        'south-east': 1,
        east: 2,
        'north-east': 3,
        north: 4,
        'north-west': 5,
        west: 6,
        'south-west': 7,
      },
    },
    run: {
      image: 'assets/sprites/run.png',
      frames: 6,
      fps: 12,
      rows: { ...DRAWN_ROWS, ...MIRRORED_ROWS },
    },
    // back-swing, strike, follow-through; the north kick PixelLab drew hid the leg behind a ball,
    // so a player kicking north is drawn with the nearest row, north-east
    kick: {
      image: 'assets/sprites/kick.png',
      frames: 3,
      fps: 12,
      rows: { south: 0, 'south-east': 1, east: 2, 'north-east': 3, ...MIRRORED_ROWS },
    },
    slide: {
      image: 'assets/sprites/slide.png',
      frames: 3,
      fps: 12,
      rows: { ...DRAWN_ROWS, ...MIRRORED_ROWS },
    },
    // the slide's own frames, down and back up, timed to a tackled player's stun
    fall: {
      image: 'assets/sprites/fall.png',
      frames: 4,
      fps: 7,
      rows: { ...DRAWN_ROWS, ...MIRRORED_ROWS },
    },
    dive: {
      image: 'assets/sprites/dive.png',
      frames: 8,
      fps: 14,
      rows: { east: 0, west: { mirrorOf: 'east' } },
    },
    celebrate: {
      image: 'assets/sprites/celebrate.png',
      frames: 8,
      fps: 10,
      rows: { south: 0 },
    },
  },
};
