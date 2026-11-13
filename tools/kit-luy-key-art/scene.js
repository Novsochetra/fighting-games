import { drawPerson, drawStool } from '../../apps/web/games/kit-luy/src/ui/figures.js';
import { createPiece } from '../../apps/web/games/kit-luy/src/ui/piece.js';
import { toKhmerDigits } from '../../apps/web/games/kit-luy/src/lib/numerals.js';
import { paintLights, paintStalls } from './market.js';
import { paintSky } from './sky.js';

const CAST = [null, 'cook', 'driver', 'students', 'shopper', 'cook', 'driver', 'students', null];
const KHMER = { digits: toKhmerDigits };

const PILES = [
  { value: 5000, count: 3, x: 2, y: 12, turn: -8 },
  { value: 500, count: 2, x: 12, y: 30, turn: 5 },
  { value: 1000, count: 4, x: 66, y: 16, turn: 6 },
];

function measure(window) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const style = window.getComputedStyle(window.document.documentElement);
  const horizon = (height * parseFloat(style.getPropertyValue('--horizon'))) / 100;

  return {
    width,
    height,
    horizon,
    unit: Math.min(height / 100, (width / 100) * 2.2),
    seat: Number(style.getPropertyValue('--seat')),
  };
}

function castFor(count) {
  const skip = Math.max(0, Math.floor((CAST.length - count) / 2));

  return CAST.slice(skip, skip + count);
}

function paintSeats(document, { width, unit, seat: seatWidth }) {
  const row = document.getElementById('seats');
  const count = Math.min(CAST.length, Math.ceil(width / (seatWidth * unit)) + 1);

  for (const kind of castFor(count)) {
    const seat = document.createElement('div');

    seat.className = 'stool';
    seat.append(drawStool(document));

    if (kind) {
      const body = document.createElement('div');

      body.className = 'guest-body';
      body.append(drawPerson(document, kind));
      seat.append(body);
    }

    row.append(seat);
  }
}

function pile(document, { value, count, x, y, turn }, scale) {
  const stack = document.createElement('div');

  stack.className = 'pile';
  stack.style.left = `${x}%`;
  stack.style.top = `${y}%`;
  stack.style.transform = `scale(${scale}) rotate(${turn}deg)`;

  for (let i = 0; i < count; i++) {
    const piece = createPiece(document, value, KHMER);

    piece.style.left = `${i * 5}px`;
    piece.style.top = `${-i * 6}px`;
    stack.append(piece);
  }

  return stack;
}

export function paintScene(document) {
  const frame = measure(document.defaultView);
  const counter = document.getElementById('counter');

  paintSky(document, frame);
  paintStalls(document, frame);
  paintSeats(document, frame);
  paintLights(document, frame);
  PILES.forEach((spec) => counter.append(pile(document, spec, frame.unit / 7)));
  document.body.dataset.painted = 'true';
}
