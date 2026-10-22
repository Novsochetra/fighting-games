const SEGMENTS = 12;

const along = (from, to, share) => ({
  x: from.x + (to.x - from.x) * share,
  y: from.y + (to.y - from.y) * share,
});

// a slash: a crisp line that swells to `width` px in its middle and thins to a point at both ends
export function taperedLine(painter, { from, to, width, color }) {
  painter.use(color);
  for (let i = 0; i < SEGMENTS; i++) {
    const swell = Math.sin((Math.PI * (i + 0.5)) / SEGMENTS);
    const thickness = Math.max(1, Math.round(width * swell));
    painter.line(along(from, to, i / SEGMENTS), along(from, to, (i + 1) / SEGMENTS), thickness);
  }
}
