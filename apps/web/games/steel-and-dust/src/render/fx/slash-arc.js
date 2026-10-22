const SEGMENTS = 14;

// a point on the curve from `from` to `to` that bows out through `control`
function onCurve({ from, control, to }, share) {
  const rest = 1 - share;
  return {
    x: rest * rest * from.x + 2 * rest * share * control.x + share * share * to.x,
    y: rest * rest * from.y + 2 * rest * share * control.y + share * share * to.y,
  };
}

// a sword's slash: a crisp arc from `from` to `to`, bowing out to its left by `bend` times its length
// (a negative bend bows it right), swelling to `width` px in its middle and thinning to a point at
// both ends
export function slashArc(painter, { from, to, bend = 0, width, color }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const control = {
    x: (from.x + to.x) / 2 + dy * bend * 2,
    y: (from.y + to.y) / 2 - dx * bend * 2,
  };
  const curve = { from, control, to };
  painter.use(color);
  for (let i = 0; i < SEGMENTS; i++) {
    const swell = Math.sin((Math.PI * (i + 0.5)) / SEGMENTS);
    const thickness = Math.max(1, Math.round(width * swell));
    painter.line(onCurve(curve, i / SEGMENTS), onCurve(curve, (i + 1) / SEGMENTS), thickness);
  }
}
