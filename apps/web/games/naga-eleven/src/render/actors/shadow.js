import { SHADOW } from '../../art/actors.js';

const spans = new Map();

function spansOf(radiusX, radiusY) {
  const key = radiusX * 64 + radiusY;
  let rows = spans.get(key);

  if (!rows) {
    rows = [];

    for (let dy = -radiusY; dy < radiusY; dy += 1) {
      const across = (dy + 0.5) / radiusY;

      rows.push({ dy, half: Math.round(radiusX * Math.sqrt(Math.max(0, 1 - across * across))) });
    }

    spans.set(key, rows);
  }

  return rows;
}

export function drawPixelEllipse(context, { x, y, radiusX, radiusY }) {
  const centreX = Math.round(x);
  const centreY = Math.round(y);

  for (const { dy, half } of spansOf(
    Math.max(1, Math.round(radiusX)),
    Math.max(1, Math.round(radiusY)),
  )) {
    if (half > 0) {
      context.fillRect(centreX - half, centreY + dy, half * 2, 1);
    }
  }
}

// the edge of the same ellipse, each row joined to the next so the ring never breaks
export function drawPixelRing(context, { x, y, radiusX, radiusY }) {
  const rows = spansOf(Math.max(1, Math.round(radiusX)), Math.max(1, Math.round(radiusY)));
  const centreX = Math.round(x);
  const centreY = Math.round(y);

  rows.forEach(({ dy, half }, i) => {
    const inner = Math.min(rows[i - 1]?.half ?? -1, rows[i + 1]?.half ?? -1);

    if (inner < 0) {
      context.fillRect(centreX - half, centreY + dy, half * 2, 1);

      return;
    }

    const width = Math.max(1, half - inner);

    context.fillRect(centreX - half, centreY + dy, width, 1);
    context.fillRect(centreX + half - width, centreY + dy, width, 1);
  });
}

export function drawShadow(context, { x, y, radiusX, radiusY, alpha }) {
  context.globalAlpha = alpha;
  context.fillStyle = SHADOW;
  drawPixelEllipse(context, { x, y, radiusX, radiusY });
  context.globalAlpha = 1;
}
