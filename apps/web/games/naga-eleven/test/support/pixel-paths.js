// what the pixel canvas fills and strokes: paths of straight edges in device pixels, with arcs and
// ellipses cut into short edges

const ARC_STEPS = 28;

export function arcPoints({ x, y, radiusX, radiusY, start, end }) {
  const sweep = end - start;
  const steps = Math.max(2, Math.ceil((ARC_STEPS * Math.abs(sweep)) / (Math.PI * 2)));

  return Array.from({ length: steps + 1 }, (_, i) => {
    const angle = start + (sweep * i) / steps;

    return [x + Math.cos(angle) * radiusX, y + Math.sin(angle) * radiusY];
  });
}

function crossingsOf(subpaths, rowY) {
  const crossings = [];

  for (const points of subpaths) {
    for (let i = 0; i < points.length; i += 1) {
      const [ax, ay] = points[i];
      const [bx, by] = points[(i + 1) % points.length];

      if (ay <= rowY !== by <= rowY) {
        crossings.push(ax + ((rowY - ay) / (by - ay)) * (bx - ax));
      }
    }
  }

  return crossings.sort((first, second) => first - second);
}

// even-odd, sampled at each pixel's centre, as a canvas does without smoothing
export function fillSubpaths(subpaths, height, paintSpan) {
  const ys = subpaths.flat().map(([, y]) => y);
  const top = Math.max(0, Math.floor(Math.min(...ys)));
  const bottom = Math.min(height - 1, Math.ceil(Math.max(...ys)));

  for (let y = top; y <= bottom; y += 1) {
    const crossings = crossingsOf(subpaths, y + 0.5);

    for (let i = 0; i + 1 < crossings.length; i += 2) {
      paintSpan(y, Math.round(crossings[i]), Math.round(crossings[i + 1]));
    }
  }
}

// a line `width` px thick from one point to the next, drawn as square dabs along it
export function strokeSegment([ax, ay], [bx, by], width, paintDab) {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay))));
  const half = Math.floor(width / 2);

  for (let i = 0; i <= steps; i += 1) {
    const x = Math.round(ax + ((bx - ax) * i) / steps) - half;
    const y = Math.round(ay + ((by - ay) * i) / steps) - half;

    paintDab(x, y, Math.max(1, Math.round(width)));
  }
}
