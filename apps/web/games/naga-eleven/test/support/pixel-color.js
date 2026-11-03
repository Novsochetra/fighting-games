const NAMED = { transparent: [0, 0, 0, 0], black: [0, 0, 0, 255], white: [255, 255, 255, 255] };

function parseHex(hex) {
  const short = hex.length <= 5;
  const digits = short ? [...hex.slice(1)].map((digit) => digit + digit).join('') : hex.slice(1);
  const values = digits.match(/../g).map((pair) => parseInt(pair, 16));

  return values.length === 3 ? [...values, 255] : values;
}

function parseFunction(text) {
  const parts = text
    .match(/rgba?\(([^)]+)\)/)?.[1]
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map(Number);

  return parts && [parts[0], parts[1], parts[2], Math.round((parts[3] ?? 1) * 255)];
}

// a gradient or a pattern paints its middle stop, which is near enough to judge a drawing by
export function parseColor(value) {
  if (value && typeof value === 'object') {
    return parseColor(value.stops?.[Math.floor(value.stops.length / 2)]?.color ?? 'black');
  }

  const text = String(value).trim().toLowerCase();

  if (text.startsWith('#')) {
    return parseHex(text);
  }

  return parseFunction(text) ?? NAMED[text] ?? [0, 0, 0, 255];
}

export function blend(data, at, [red, green, blue, alpha]) {
  const cover = alpha / 255;
  const keep = 1 - cover;

  data[at] = red * cover + data[at] * keep;
  data[at + 1] = green * cover + data[at + 1] * keep;
  data[at + 2] = blue * cover + data[at + 2] * keep;
  data[at + 3] = alpha + data[at + 3] * keep;
}

export const fontSizeOf = (font) => Number(String(font).match(/(\d+(?:\.\d+)?)px/)?.[1] ?? 10);

export function gradient() {
  return {
    stops: [],
    addColorStop(offset, color) {
      this.stops.push({ offset, color });
    },
  };
}
