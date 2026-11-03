import { project } from '../camera.js';

// each world point where the view draws it, `lift` above it
export const screenPath = (camera, points, lift = 0) =>
  points.map((point) => project(camera, point.x, point.y, (point.z ?? 0) + lift));

function lengthsOf(points) {
  const lengths = [0];

  for (let i = 1; i < points.length; i += 1) {
    const step = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);

    lengths.push(lengths[i - 1] + step);
  }

  return lengths;
}

function sampleAt(points, lengths, along) {
  let i = 1;

  while (i < points.length - 1 && lengths[i] < along) {
    i += 1;
  }

  const from = points[i - 1];
  const to = points[i];
  const span = Math.max(1e-6, lengths[i] - lengths[i - 1]);
  const share = Math.min(1, Math.max(0, (along - lengths[i - 1]) / span));
  const reach = Math.hypot(to.x - from.x, to.y - from.y) || 1;

  return {
    x: from.x + (to.x - from.x) * share,
    y: from.y + (to.y - from.y) * share,
    dx: (to.x - from.x) / reach,
    dy: (to.y - from.y) / reach,
  };
}

// a drawn path cut into evenly spaced samples, a few pixels apart and never more than `most`, each
// with the way the path runs there and `t` from 0 at its tail to 1 at its head; `step` is the gap
export function resample(points, { spacing = 4, most = 32 } = {}) {
  const lengths = lengthsOf(points);
  const total = lengths.at(-1) ?? 0;

  if (points.length < 2 || total < 2) {
    return { samples: [], step: 0, length: total };
  }

  const count = Math.max(2, Math.min(most, Math.round(total / spacing) + 1));
  const samples = [];

  for (let i = 0; i < count; i += 1) {
    const share = i / (count - 1);

    samples.push({ ...sampleAt(points, lengths, total * share), t: share });
  }

  return { samples, step: total / (count - 1), length: total };
}
