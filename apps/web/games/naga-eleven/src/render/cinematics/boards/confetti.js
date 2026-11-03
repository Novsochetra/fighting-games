import { CONFETTI_SPARKLE } from '../../../art/cinematics/palette.js';
import { VIEW } from '../../../config.js';
import { hashOf } from '../shared/hash.js';

const PIECES = 120;
const LOOP = VIEW.height + 24;

// a piece turning over as it falls: broad, square, edge on, square again
const TURNS = [
  [4, 3],
  [3, 3],
  [1, 3],
  [3, 3],
];

export const confettiColours = (kit) => [
  kit.band[2],
  kit.band[3],
  kit.trim[2],
  kit.shorts[2],
  ...CONFETTI_SPARKLE,
];

// where each piece is `age` ticks into the fall, the same every time; pieces start a little apart
// and fall again from the top once they are out of the view
export function confettiPieces(age, { count = PIECES, colours = 1 } = {}) {
  const pieces = [];

  for (let i = 0; i < count; i += 1) {
    const fall = (age - hashOf(i, 3) * 80) * (0.7 + hashOf(i, 2) * 1.1);

    if (fall >= 0) {
      const sway = Math.sin((age + i * 11) / (14 + hashOf(i, 4) * 10)) * (2 + hashOf(i, 5) * 6);
      const [width, height] = TURNS[Math.floor((age + i * 5) / 5) % TURNS.length];

      pieces.push({
        x: Math.round(hashOf(i, 1) * VIEW.width + sway),
        y: Math.round((fall % LOOP) - 12),
        width,
        height,
        colour: Math.floor(hashOf(i, 6) * colours),
        layer: i % 2,
      });
    }
  }

  return pieces;
}

const inView = ({ x, y, width, height }) =>
  x >= 0 && y >= 0 && x + width <= VIEW.width && y + height <= VIEW.height;

// layer 0 falls behind the board and layer 1 in front of it
export function drawConfetti(context, { colours, age, layer }) {
  for (const piece of confettiPieces(age, { colours: colours.length })) {
    if (piece.layer === layer && inView(piece)) {
      context.fillStyle = colours[piece.colour];
      context.fillRect(piece.x, piece.y, piece.width, piece.height);
    }
  }
}
