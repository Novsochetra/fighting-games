import { drawPerson, drawStool } from '../../apps/web/games/kit-luy/src/ui/figures.js';
import { paintLights, paintStalls } from './market.js';
import { paintSky } from './sky.js';

const CAST = [
  'cook',
  'driver',
  'students',
  'shopper',
  null,
  'driver',
  'cook',
  'shopper',
  'students',
];

function readNumber(style, name) {
  const value = parseFloat(style.getPropertyValue(name));

  if (!Number.isFinite(value)) {
    throw new Error(`${name} is not a plain number`);
  }

  return value;
}

// the unit is set here, not in the CSS, so the counts below and the CSS sizes share one value
function measure(window) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const root = window.document.documentElement;
  const unit = Math.min(height / 100, (width / 100) * 2.2);

  root.style.setProperty('--u', `${unit}px`);

  const style = window.getComputedStyle(root);

  return {
    width,
    height,
    unit,
    horizon: (height * readNumber(style, '--horizon')) / 100,
    seat: readNumber(style, '--seat'),
    stallStep: readNumber(style, '--stall-wide') + readNumber(style, '--stall-gap'),
  };
}

// the row's middle seat sits under the carousel's centre, so the cast is laid out from there
function castFor(count) {
  const middle = Math.floor(count / 2);

  return Array.from({ length: count }, (_, i) => CAST.at((i - middle) % CAST.length));
}

function seatFor(document, kind) {
  const seat = document.createElement('div');

  seat.className = 'stool';
  seat.append(drawStool(document));

  if (kind) {
    const body = document.createElement('div');

    body.className = 'guest-body';
    body.append(drawPerson(document, kind));
    seat.append(body);
  }

  return seat;
}

function paintSeats(document, { width, unit, seat }) {
  const row = document.getElementById('seats');
  const count = Math.ceil(width / (seat * unit)) + 1;

  castFor(count).forEach((kind) => row.append(seatFor(document, kind)));
}

export function paintScene(document) {
  const frame = measure(document.defaultView);

  paintSky(document, frame);
  paintStalls(document, frame);
  paintSeats(document, frame);
  paintLights(document, frame);
  document.body.dataset.painted = 'true';
}
