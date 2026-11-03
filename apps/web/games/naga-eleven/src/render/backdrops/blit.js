import { ART_SCALE } from './raster.js';

const styles = new Map();

function styleAt(data, at) {
  const key = ((data[at] << 24) | (data[at + 1] << 16) | (data[at + 2] << 8) | data[at + 3]) >>> 0;
  let style = styles.get(key);

  if (!style) {
    style = `rgba(${data[at]}, ${data[at + 1]}, ${data[at + 2]}, ${data[at + 3] / 255})`;
    styles.set(key, style);
  }

  return style;
}

const samePixel = (data, first, second) =>
  data[first] === data[second] &&
  data[first + 1] === data[second + 1] &&
  data[first + 2] === data[second + 2] &&
  data[first + 3] === data[second + 3];

function drawRow(context, raster, { row, x, y, scale }) {
  const { data, width } = raster;
  let start = 0;

  for (let column = 1; column <= width; column += 1) {
    const from = (row * width + start) * 4;

    if (column === width || !samePixel(data, from, (row * width + column) * 4)) {
      if (data[from + 3] > 0) {
        context.fillStyle = styleAt(data, from);
        context.fillRect(x + start * scale, y + row * scale, (column - start) * scale, scale);
      }

      start = column;
    }
  }
}

// with no canvas to cache into (a test in Node), a buffer is laid down as runs of one colour
export function drawRasterRuns(context, raster, { x = 0, y = 0, scale = ART_SCALE } = {}) {
  for (let row = 0; row < raster.height; row += 1) {
    drawRow(context, raster, { row, x, y, scale });
  }
}

export function rasterToCanvas(raster, factory) {
  const canvas = factory(raster.width, raster.height);
  const context = canvas.getContext('2d');
  const image = context.createImageData(raster.width, raster.height);

  image.data.set(raster.data);
  context.putImageData(image, 0, 0);

  return canvas;
}
