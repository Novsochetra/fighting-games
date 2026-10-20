const BLACK = [0, 0, 0];
const WHITE = [255, 255, 255];

function channels(hex) {
  const value = parseInt(hex.slice(1, 7), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function toHex(rgb) {
  return `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;
}

function blend(from, to, amount) {
  return from.map((channel, i) => channel + (to[i] - channel) * amount);
}

export function mixColors(from, to, amount) {
  return toHex(blend(channels(from), channels(to), amount));
}

// positive amounts lighten toward white, negative ones darken toward black
export function shadeColor(hex, amount) {
  return toHex(blend(channels(hex), amount < 0 ? BLACK : WHITE, Math.abs(amount)));
}

export function withAlpha(hex, alpha) {
  return `rgba(${channels(hex).join(',')},${alpha})`;
}

// `count` evenly spaced colors along a gradient through every stop
export function gradientSteps(stops, count) {
  const steps = [];
  for (let i = 0; i < count; i++) {
    const position = (i / (count - 1)) * (stops.length - 1);
    const index = Math.min(Math.floor(position), stops.length - 2);
    steps.push(mixColors(stops[index], stops[index + 1], position - index));
  }
  return steps;
}
