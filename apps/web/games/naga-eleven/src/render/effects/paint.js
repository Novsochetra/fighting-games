// a block of pixels centred on a point, on whole pixels
export function dab(context, { x, y }, width, height = width) {
  const wide = Math.max(1, Math.round(width));
  const tall = Math.max(1, Math.round(height));

  context.fillRect(Math.round(x - wide / 2), Math.round(y - tall / 2), wide, tall);
}

// one sample of a band: as long as the gap to the next along the way the path mostly runs, and
// `thickness` across it, so the samples join into one stepped line
export function dabAcross(context, sample, { thickness, step }) {
  const isFlat = Math.abs(sample.dx) >= Math.abs(sample.dy);
  const along = Math.ceil(step) + 1;

  dab(context, sample, isFlat ? along : thickness, isFlat ? thickness : along);
}

// a line between two points, one rect for each step along its shorter side
export function drawLine(context, from, to, thickness = 1) {
  const start = { x: Math.round(from.x), y: Math.round(from.y) };
  const span = { x: Math.round(to.x) - start.x, y: Math.round(to.y) - start.y };
  const isFlat = Math.abs(span.x) >= Math.abs(span.y);
  const steps = Math.abs(isFlat ? span.y : span.x) + 1;
  const half = Math.floor(thickness / 2);

  for (let i = 0; i < steps; i += 1) {
    const near = (isFlat ? span.x : span.y) * (i / steps);
    const far = (isFlat ? span.x : span.y) * ((i + 1) / steps);
    const low = Math.round(Math.min(near, far));
    const length = Math.max(1, Math.round(Math.abs(far - near)));
    const side = Math.sign(isFlat ? span.y : span.x) * i;

    if (isFlat) {
      context.fillRect(start.x + low, start.y + side - half, length, thickness);
    } else {
      context.fillRect(start.x + side - half, start.y + low, thickness, length);
    }
  }
}

// the way across a path, turned a quarter from the way it runs, pointing up the view where it can
export function across(sample) {
  const normal = { x: -sample.dy, y: sample.dx };

  return normal.y > 0 ? { x: -normal.x, y: -normal.y } : normal;
}
