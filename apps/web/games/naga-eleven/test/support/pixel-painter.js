import { blend, fontSizeOf, parseColor } from './pixel-color.js';

// what the pixel canvas paints with, in device pixels, under the context's current state
export function createPainter(canvas, stateOf) {
  const toDevice = (x, y) => {
    const state = stateOf();

    return [x * state.scaleX + state.offsetX, y * state.scaleY + state.offsetY];
  };

  function paint(x, y, color) {
    if (x >= 0 && y >= 0 && x < canvas.width && y < canvas.height) {
      const alpha = color[3] * stateOf().globalAlpha;

      blend(canvas.data, (y * canvas.width + x) * 4, [color[0], color[1], color[2], alpha]);
    }
  }

  function paintRect({ left, top, right, bottom }, color) {
    for (let y = Math.max(0, top); y < Math.min(canvas.height, bottom); y += 1) {
      for (let x = Math.max(0, left); x < Math.min(canvas.width, right); x += 1) {
        paint(x, y, color);
      }
    }
  }

  function deviceRect({ x, y, width, height }) {
    const [ax, ay] = toDevice(x, y);
    const [bx, by] = toDevice(x + width, y + height);

    return {
      left: Math.round(Math.min(ax, bx)),
      top: Math.round(Math.min(ay, by)),
      right: Math.round(Math.max(ax, bx)),
      bottom: Math.round(Math.max(ay, by)),
    };
  }

  function sample(image, sx, sy) {
    if (sx < 0 || sy < 0 || sx >= image.width || sy >= image.height) {
      return [0, 0, 0, 0];
    }

    const at = (Math.floor(sy) * image.width + Math.floor(sx)) * 4;

    return [image.data[at], image.data[at + 1], image.data[at + 2], image.data[at + 3]];
  }

  function drawImage(image, args) {
    const [sx, sy, sw, sh, dx, dy, dw, dh] =
      args.length === 8
        ? args
        : [
            0,
            0,
            image.width,
            image.height,
            args[0],
            args[1],
            args[2] ?? image.width,
            args[3] ?? image.height,
          ];
    const [ax, ay] = toDevice(dx, dy);
    const [bx, by] = toDevice(dx + dw, dy + dh);
    const box = deviceRect({ x: dx, y: dy, width: dw, height: dh });

    for (let y = Math.max(0, box.top); y < Math.min(canvas.height, box.bottom); y += 1) {
      for (let x = Math.max(0, box.left); x < Math.min(canvas.width, box.right); x += 1) {
        const across = (x + 0.5 - ax) / (bx - ax);
        const down = (y + 0.5 - ay) / (by - ay);

        paint(x, y, sample(image, sx + across * sw, sy + down * sh));
      }
    }
  }

  // one solid block a letter: enough to see where a line of text stands and how far it runs
  function fillText(text, x, y) {
    const state = stateOf();
    const size = fontSizeOf(state.font) * Math.abs(state.scaleY);
    const advance = Math.round(size * 0.6);
    const width = advance * [...text].length;
    const shift = { center: width / 2, right: width, end: width }[state.textAlign] ?? 0;
    const [left, baseline] = toDevice(x, y);
    const top =
      { top: baseline, middle: baseline - size * 0.35 }[state.textBaseline] ??
      baseline - size * 0.7;
    const color = parseColor(state.fillStyle);

    [...text].forEach((letter, i) => {
      const from = Math.round(left - shift + i * advance);

      if (letter.trim()) {
        paintRect(
          {
            left: from,
            top: Math.round(top),
            right: from + advance - 1,
            bottom: Math.round(top + size * 0.7),
          },
          color,
        );
      }
    });
  }

  return { toDevice, paintRect, deviceRect, drawImage, fillText };
}
