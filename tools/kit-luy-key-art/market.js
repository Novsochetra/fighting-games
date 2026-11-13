import { seededRandom, svgShape } from './sky.js';

const FRUIT = ['fruit-a', 'fruit-b', 'fruit-c'];
const VENDOR = 'M-4 20 L-3.4 12 Q-3 9.6 0 9.6 Q3 9.6 3.4 12 L4 20 Z';

function paintVendor(document, svg, vendorAt) {
  svg.append(
    svgShape(document, 'path', {
      d: VENDOR,
      transform: `translate(${vendorAt} 0)`,
      class: 'vendor',
    }),
  );
  svg.append(svgShape(document, 'circle', { cx: vendorAt, cy: 6.6, r: 2.8, class: 'vendor' }));
}

function stallGoods(document, random) {
  const svg = svgShape(document, 'svg', { viewBox: '0 0 30 20', class: 'stall-goods' });

  if (random() > 0.35) {
    paintVendor(document, svg, 6 + random() * 18);
  }

  for (let x = 3 + random() * 3; x < 28; x += 6 + random() * 4) {
    const kind = FRUIT[Math.floor(random() * FRUIT.length)];

    svg.append(
      svgShape(document, 'ellipse', { cx: x, cy: 20, rx: 3.6, ry: 4.2, class: `fruit ${kind}` }),
    );
  }

  return svg;
}

export function paintStalls(document, { width, unit, stallStep }) {
  const row = document.getElementById('stalls');
  const random = seededRandom(23);
  const count = Math.ceil(width / (stallStep * unit)) + 1;

  for (let i = 0; i < count; i++) {
    const stall = document.createElement('div');

    stall.className = 'stall';
    stall.style.setProperty('--wide', String(12 + random() * 6));
    stall.style.setProperty('--tall', String(9 + random() * 3));
    stall.append(stallGoods(document, random));
    row.append(stall);
  }
}

const along = (from, bend, to, progress) =>
  (1 - progress) ** 2 * from + 2 * (1 - progress) * progress * bend + progress ** 2 * to;

function hangString(document, svg, { x0, x1, y, sag, bulbs, radius }) {
  const bendX = (x0 + x1) / 2;
  const bendY = y + sag * 2;

  svg.append(
    svgShape(document, 'path', { d: `M${x0} ${y} Q${bendX} ${bendY} ${x1} ${y}`, class: 'wire' }),
  );

  for (let i = 1; i < bulbs; i++) {
    const progress = i / bulbs;
    const cx = along(x0, bendX, x1, progress);
    const cy = along(y, bendY, y, progress) + radius * 1.2;

    svg.append(svgShape(document, 'circle', { cx, cy, r: radius, class: 'bulb' }));
  }
}

// the arcade's prompt and pager sit over the middle of the top, so no string hangs there
export function paintLights(document, { width, height, unit }) {
  const svg = document.getElementById('lights');
  const spans = Math.max(3, Math.round(width / (unit * 40))) | 1;
  const spanWidth = width / spans;
  const middle = (spans - 1) / 2;

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  for (let i = 0; i < spans; i++) {
    if (i !== middle) {
      hangString(document, svg, {
        x0: i * spanWidth,
        x1: (i + 1) * spanWidth,
        y: unit * 6,
        sag: unit * 3.5,
        bulbs: Math.max(5, Math.round(spanWidth / (unit * 4))),
        radius: unit * 0.7,
      });
    }
  }
}
