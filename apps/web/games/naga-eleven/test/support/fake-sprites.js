import { createPixelCanvas } from './pixel-canvas.js';

// Sprite sheets in the manifest's format (src/data/sprites.js), painted here so the drawing can be
// tested before and whatever the real sheets are. Each frame is a stack of bands, one a shade of a
// part, in the colours FAKE_KIT names, with a mark on its left that a mirrored frame shows on its
// right
export const FAKE_KIT = {
  shirt: ['#300000', '#500000', '#700000', '#900000'],
  shorts: ['#003000', '#005000', '#007000'],
  socks: ['#000030', '#000050'],
  skin: ['#302010', '#503020', '#704030'],
  hair: ['#101018', '#202028'],
};

export const MARK = '#ff00ff';

const ALL_WAYS = {
  south: 0,
  'south-east': 1,
  east: 2,
  'north-east': 3,
  north: 4,
  'north-west': { mirrorOf: 'north-east' },
  west: { mirrorOf: 'east' },
  'south-west': { mirrorOf: 'south-east' },
};

// the idle is drawn only three ways, and the kick only one, as a sheet may be
const IDLE_WAYS = { south: 0, east: 1, north: 2, west: { mirrorOf: 'east' } };

export const FAKE_SPRITES = {
  frame: { width: 12, height: 18 },
  anchor: { x: 6, y: 17 },
  directions: Object.keys(ALL_WAYS),
  animations: {
    idle: { image: 'fake/idle.png', frames: 2, fps: 4, rows: IDLE_WAYS },
    run: { image: 'fake/run.png', frames: 4, fps: 12, rows: ALL_WAYS },
    kick: { image: 'fake/kick.png', frames: 3, fps: 15, rows: { east: 0 } },
  },
};

const BANDS = [
  ...FAKE_KIT.hair,
  ...FAKE_KIT.skin,
  ...FAKE_KIT.shirt,
  ...FAKE_KIT.shorts,
  ...FAKE_KIT.socks,
];

function paintFrame(context, { left, top }) {
  const { width } = FAKE_SPRITES.frame;

  BANDS.forEach((colour, row) => {
    context.fillStyle = colour;
    context.fillRect(left + 2, top + row, width - 4, 1);
  });
  context.fillStyle = MARK;
  context.fillRect(left + 2, top + 8, 1, 1);
}

export function fakeSheet(name) {
  const animation = FAKE_SPRITES.animations[name];
  const { width, height } = FAKE_SPRITES.frame;
  const rows = Math.max(...Object.values(animation.rows).filter(Number.isInteger)) + 1;
  const sheet = createPixelCanvas(animation.frames * width, rows * height);
  const context = sheet.getContext('2d');

  for (let row = 0; row < rows; row += 1) {
    for (let frame = 0; frame < animation.frames; frame += 1) {
      paintFrame(context, { left: frame * width, top: row * height });
    }
  }

  return sheet;
}

// a loader that answers with the painted sheets, counting what it was asked for
export function fakeImageLoader({ failing = [] } = {}) {
  const asked = [];
  const bySource = Object.fromEntries(
    Object.entries(FAKE_SPRITES.animations).map(([name, animation]) => [animation.image, name]),
  );
  const loadImage = (source) => {
    asked.push(source);

    return failing.includes(source)
      ? Promise.reject(new Error(`no ${source}`))
      : Promise.resolve(fakeSheet(bySource[source]));
  };

  return { loadImage, asked };
}
