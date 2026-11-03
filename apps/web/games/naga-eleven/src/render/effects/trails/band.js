// a band along a trail's samples, each sample a block reaching to the next, so they meet edge to
// edge and a faint layer shows no seams; `thickness(sample)` and `offset(sample)` shape it
export function drawBand(context, samples, { colour, thickness, offset = null, from = 0 }) {
  context.fillStyle = colour;

  for (let i = 0; i < samples.length - 1; i += 1) {
    const sample = samples[i];

    if (sample.t >= from) {
      const shift = offset ? offset(sample) : 0;

      blockBetween(context, sample, samples[i + 1], { width: thickness(sample), shift });
    }
  }
}

// from one sample to the next along the way the path mostly runs, `width` across it, moved
// `shift` pixels up the view (or left, where it runs up and down); across, it reaches over both
// samples, so a steep stretch leaves no gaps between its steps
export function blockBetween(context, sample, next, { width, shift = 0 }) {
  const isFlat = Math.abs(sample.dx) >= Math.abs(sample.dy);
  const size = Math.max(1, Math.round(width));
  const along = [isFlat ? sample.x : sample.y, isFlat ? next.x : next.y].map(Math.round);
  const side = [isFlat ? sample.y : sample.x, isFlat ? next.y : next.x].map((value) =>
    Math.round(value - size / 2 - shift),
  );
  const low = Math.min(...along);
  const length = Math.max(1, Math.abs(along[1] - along[0]));
  const near = Math.min(...side);
  const span = Math.max(size, Math.min(Math.abs(side[1] - side[0]) + 1, size + 6));

  if (isFlat) {
    context.fillRect(low, near, length, span);
  } else {
    context.fillRect(near, low, span, length);
  }
}
