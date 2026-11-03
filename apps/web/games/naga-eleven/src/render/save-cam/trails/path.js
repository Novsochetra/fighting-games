// the trail as points on the art grid, newest (the ball) last, each with the ball's radius there;
// filled in between so a fast ball near the camera leaves no gaps, more sparsely where it is big
export function smoothTrail(points, { step = 3 } = {}) {
  const filled = [];

  points.forEach((at, i) => {
    const next = points[i + 1];

    filled.push(at);

    if (!next) {
      return;
    }

    const spacing = Math.max(step, at.radius * 0.7);
    const steps = Math.floor(Math.hypot(next.x - at.x, next.y - at.y) / spacing);

    for (let j = 1; j < steps; j += 1) {
      const share = j / steps;

      filled.push({
        x: at.x + (next.x - at.x) * share,
        y: at.y + (next.y - at.y) * share,
        radius: at.radius + (next.radius - at.radius) * share,
      });
    }
  });

  return filled;
}

// the way the ball heads at a point of its trail, as a unit step and its side
export function headingAt(points, i) {
  const from = points[Math.max(0, i - 1)];
  const to = points[Math.min(points.length - 1, i + 1)];
  const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  const along = { x: (to.x - from.x) / length, y: (to.y - from.y) / length };

  return { along, side: { x: -along.y, y: along.x } };
}

// a point pushed off the trail to its side, by a share of the ball's radius there
export function swayed(points, { amount, tick, phase = 0, rate = 0.7 }) {
  return points.map((at, i) => {
    const { side } = headingAt(points, i);
    const swing = Math.sin(i * rate + tick * 0.3 + phase) * amount * at.radius;

    return { ...at, x: at.x + side.x * swing, y: at.y + side.y * swing };
  });
}
