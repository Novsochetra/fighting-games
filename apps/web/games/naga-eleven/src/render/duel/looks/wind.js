import { band } from '../shapes.js';

// a stroke of wind: part of a ring, thick in its middle and thin at its ends, turning as it blows
export function drawWindArc(pen, { x, y, radius, turn, sweep = 2.4, color, edge }) {
  const steps = 7;
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const angle = turn + (i / steps) * sweep;

    return { x: x + Math.cos(angle) * radius, y: y + Math.sin(angle) * radius * 0.6 };
  });

  points.slice(1).forEach((to, i) => {
    const middle = 1 - Math.abs(i / (steps - 1) - 0.5) * 2;

    if (edge) {
      band(pen, { from: points[i], to, width: 2 + middle * 2, color: edge });
    }

    band(pen, { from: points[i], to, width: 1 + middle * 1.5, color });
  });
}

// Hanuman's white wind wound about a path, every few points a stroke of it
export function drawWindAbout(pen, { points, art, tick, every = 3, size = 1 }) {
  points.forEach((at, i) => {
    if (i % every !== 0) {
      return;
    }

    drawWindArc(pen, {
      ...at,
      radius: (6 + (i / points.length) * 8) * size,
      turn: tick * 0.3 + i,
      color: art.accent[3],
      edge: art.accent[1],
    });
  });
}
