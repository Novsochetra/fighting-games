const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

// a 16-bit game fades by lighting a share of the pixels in a fixed 4 by 4 pattern, never by blur
export const dithered = (x, y, share) =>
  (BAYER[(Math.round(y) & 3) * 4 + (Math.round(x) & 3)] + 0.5) / 16 < share;

export function stepped(ramp, level) {
  const at = Math.floor(Math.max(0, Math.min(0.999, level)) * ramp.length);

  return ramp[at];
}

export function dotLine(pen, { from, to, color, colorAt }) {
  const steps = Math.max(1, Math.round(Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y))));

  for (let i = 0; i <= steps; i += 1) {
    const share = i / steps;
    const x = Math.round(from.x + (to.x - from.x) * share);
    const y = Math.round(from.y + (to.y - from.y) * share);

    pen.dot(x, y, colorAt ? colorAt(share) : color);
  }
}

export const rampLine = (pen, { head, tail, ramp }) =>
  dotLine(pen, { from: tail, to: head, colorAt: (share) => stepped(ramp, share) });

export function ellipseDots(pen, { x, y, radiusX, radiusY, tilt = 0, pick }) {
  const count = Math.max(12, Math.round(Math.max(radiusX, radiusY) * 9));
  const [cos, sin] = [Math.cos(tilt), Math.sin(tilt)];
  let last = '';

  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const across = Math.cos(angle) * radiusX;
    const down = Math.sin(angle) * radiusY;
    const dotX = Math.round(x + across * cos - down * sin);
    const dotY = Math.round(y + across * sin + down * cos);
    const color = `${dotX},${dotY}` === last ? null : pick(angle, dotX, dotY);

    last = `${dotX},${dotY}`;
    pen.dot(dotX, dotY, color);
  }
}

function outlineRun(pen, { x, y, row, from, to, radii, pick }) {
  for (let column = from; column <= to; column += 1) {
    const angle = Math.atan2(row / radii.y, column / radii.x);

    pen.dot(x + column, y + row, pick(angle, x + column, y + row));
  }
}

// each row reaches to where the next one out begins, so the line never breaks on a flat ellipse
export function ellipseOutline(pen, { x, y, radiusX, radiusY, pick }) {
  const rows = Math.max(1, Math.round(radiusY));
  const radii = { x: radiusX, y: radiusY };
  const halfAt = (row) =>
    row > rows ? -1 : Math.round(radiusX * Math.sqrt(1 - (row / (rows + 0.5)) ** 2));

  for (let row = -rows; row <= rows; row += 1) {
    const outer = halfAt(Math.abs(row));
    const inner = Math.max(0, Math.min(outer, halfAt(Math.abs(row) + 1) + 1));
    const run = { x: Math.round(x), y: Math.round(y), row, radii, pick };

    if (inner === 0) {
      outlineRun(pen, { ...run, from: -outer, to: outer });
    } else {
      outlineRun(pen, { ...run, from: inner, to: outer });
      outlineRun(pen, { ...run, from: -outer, to: -inner });
    }
  }
}

export function ditherEllipse(pen, { x, y, radiusX, radiusY, color, share }) {
  for (let row = Math.ceil(y - radiusY); row <= Math.floor(y + radiusY); row += 1) {
    const down = (row - y) / radiusY;
    const half = Math.round(radiusX * Math.sqrt(Math.max(0, 1 - down * down)));

    for (let column = Math.round(x) - half; column <= Math.round(x) + half; column += 1) {
      if (dithered(column, row, share)) {
        pen.dot(column, row, color);
      }
    }
  }
}

export function spark(pen, { x, y, reach, core, arm }) {
  const [left, top] = [Math.round(x), Math.round(y)];

  if (reach >= 1) {
    pen.rect([left - reach, top, reach * 2 + 1, 1], arm);
    pen.rect([left, top - reach, 1, reach * 2 + 1], arm);
  }

  pen.dot(left, top, core);
}
