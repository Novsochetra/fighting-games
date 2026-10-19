// Curve points are flat, [time, value, time, value, ...], so the sound tables stay one line per
// curve instead of one line per point.
export function toPairs(points) {
  const pairs = [];
  for (let i = 0; i < points.length; i += 2) {
    pairs.push([points[i], points[i + 1]]);
  }
  return pairs;
}

const blendExponential = (from, to, progress) => from * Math.pow(to / from, progress);
const blendLinear = (from, to, progress) => from + (to - from) * progress;

function curve(points, blend) {
  const pairs = toPairs(points);
  return (time) => {
    let i = 0;
    while (i < pairs.length - 2 && time > pairs[i + 1][0]) {
      i++;
    }
    const from = pairs[i];
    const to = pairs[i + 1] || from;
    if (time <= from[0]) {
      return from[1];
    }
    if (time >= to[0]) {
      return to[1];
    }
    return blend(from[1], to[1], (time - from[0]) / (to[0] - from[0]));
  };
}

// exponential for pitches and cutoffs, linear for levels
export const expCurve = (points) => curve(points, blendExponential);
export const linearCurve = (points) => curve(points, blendLinear);

export const glide = (from, seconds, to) => expCurve([0, from, seconds, to]);

export function asCurve(value) {
  return typeof value === 'function' ? value : () => value;
}
