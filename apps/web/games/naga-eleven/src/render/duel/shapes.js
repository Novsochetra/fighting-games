// filled shapes in art pixels, each sampled at the middle of every row it covers

export function ellipse(pen, { x, y, radiusX, radiusY = radiusX, color }) {
  if (radiusX <= 0 || radiusY <= 0) {
    return;
  }

  for (let row = Math.floor(y - radiusY); row <= Math.ceil(y + radiusY); row += 1) {
    const down = (row + 0.5 - y) / radiusY;

    if (Math.abs(down) < 1) {
      const half = radiusX * Math.sqrt(1 - down * down);

      pen.rect([Math.round(x - half), row, Math.round(x + half) - Math.round(x - half), 1], color);
    }
  }
}

export const disc = (pen, { x, y, radius, color }) =>
  ellipse(pen, { x, y, radiusX: radius, radiusY: radius, color });

function crossings(points, rowY) {
  const found = [];

  points.forEach(([ax, ay], i) => {
    const [bx, by] = points[(i + 1) % points.length];

    if (ay <= rowY !== by <= rowY) {
      found.push(ax + ((rowY - ay) / (by - ay)) * (bx - ax));
    }
  });

  return found.sort((first, second) => first - second);
}

export function polygon(pen, points, color) {
  const ys = points.map(([, y]) => y);

  for (let row = Math.floor(Math.min(...ys)); row <= Math.ceil(Math.max(...ys)); row += 1) {
    const found = crossings(points, row + 0.5);

    for (let i = 0; i + 1 < found.length; i += 2) {
      pen.rect(
        [Math.round(found[i]), row, Math.round(found[i + 1]) - Math.round(found[i]), 1],
        color,
      );
    }
  }
}

// a band `width` art pixels thick from one point to the next
export function band(pen, { from, to, width, color }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = (-dy / length) * (width / 2);
  const ny = (dx / length) * (width / 2);

  polygon(
    pen,
    [
      [from.x + nx, from.y + ny],
      [to.x + nx, to.y + ny],
      [to.x - nx, to.y - ny],
      [from.x - nx, from.y - ny],
    ],
    color,
  );
}

export function ring(pen, { x, y, radius, width = 1, color }) {
  for (let row = Math.floor(y - radius); row <= Math.ceil(y + radius); row += 1) {
    const down = row + 0.5 - y;
    const outer = Math.sqrt(Math.max(0, radius * radius - down * down));
    const innerRadius = radius - width;
    const inner =
      Math.abs(down) < innerRadius ? Math.sqrt(innerRadius * innerRadius - down * down) : 0;

    if (Math.abs(down) < radius) {
      pen.rect([Math.round(x - outer), row, Math.round(outer - inner), 1], color);
      pen.rect([Math.round(x + inner), row, Math.round(outer - inner), 1], color);
    }
  }
}
