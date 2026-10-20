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

// positive amounts lighten toward white, negative ones darken toward black
export function shadeColor(hex, amount) {
  return toHex(blend(channels(hex), amount < 0 ? BLACK : WHITE, Math.abs(amount)));
}
