import { gradient, fontSizeOf, parseColor } from './pixel-color.js';
import { createPainter } from './pixel-painter.js';
import { arcPoints, fillSubpaths, strokeSegment } from './pixel-paths.js';
import { encodePng } from './png.js';

// A canvas that draws into plain RGBA pixels in Node, so a test or a helper can look at what a
// renderer drew as a png. It knows what pixel art draws with: rects, straight paths, arcs and
// ellipses, images at whole pixels, translate and scale (no rotation). Text comes out as one solid
// block a letter, enough to see where it stands and how wide it runs.

const freshState = () => ({
  fillStyle: '#000000',
  strokeStyle: '#000000',
  globalAlpha: 1,
  lineWidth: 1,
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  imageSmoothingEnabled: false,
  globalCompositeOperation: 'source-over',
  scaleX: 1,
  scaleY: 1,
  offsetX: 0,
  offsetY: 0,
});

function pathMethods(painter, paths) {
  const addCurve = (curve) =>
    paths.list.push(arcPoints(curve).map(([x, y]) => painter.toDevice(x, y)));

  return {
    beginPath: () => {
      paths.list = [];
    },
    moveTo: (x, y) => paths.list.push([painter.toDevice(x, y)]),
    lineTo: (x, y) => {
      if (paths.list.length === 0) {
        paths.list.push([]);
      }

      paths.list.at(-1).push(painter.toDevice(x, y));
    },
    closePath: () => {},
    rect: (x, y, width, height) =>
      paths.list.push([
        painter.toDevice(x, y),
        painter.toDevice(x + width, y),
        painter.toDevice(x + width, y + height),
        painter.toDevice(x, y + height),
      ]),
    arc: (...[x, y, radius, start, end]) =>
      addCurve({ x, y, radiusX: radius, radiusY: radius, start, end }),
    ellipse: (...[x, y, radiusX, radiusY, , start, end]) =>
      addCurve({ x, y, radiusX, radiusY, start, end }),
  };
}

function paintMethods({ canvas, painter, paths, stateOf }) {
  return {
    fillRect: (x, y, width, height) =>
      painter.paintRect(
        painter.deviceRect({ x, y, width, height }),
        parseColor(stateOf().fillStyle),
      ),
    clearRect: (x, y, width, height) => {
      const box = painter.deviceRect({ x, y, width, height });

      for (let row = Math.max(0, box.top); row < Math.min(canvas.height, box.bottom); row += 1) {
        const from = row * canvas.width + Math.max(0, box.left);

        canvas.data.fill(0, from * 4, (row * canvas.width + Math.min(canvas.width, box.right)) * 4);
      }
    },
    fill: () => {
      const color = parseColor(stateOf().fillStyle);
      const shapes = paths.list.filter((points) => points.length > 2);

      fillSubpaths(shapes, canvas.height, (row, from, to) =>
        painter.paintRect({ left: from, top: row, right: to, bottom: row + 1 }, color),
      );
    },
    stroke: () => {
      const state = stateOf();
      const color = parseColor(state.strokeStyle);
      const dab = (x, y, size) =>
        painter.paintRect({ left: x, top: y, right: x + size, bottom: y + size }, color);

      for (const points of paths.list) {
        points.slice(1).forEach((point, i) => {
          strokeSegment(points[i], point, state.lineWidth * Math.abs(state.scaleX), dab);
        });
      }
    },
    drawImage: (image, ...args) => painter.drawImage(image, args),
    fillText: (text, x, y) => painter.fillText(text, x, y),
    strokeText: (text, x, y) => painter.fillText(text, x, y),
  };
}

function imageMethods(canvas, stateOf) {
  return {
    measureText: (text) => ({
      width: Math.round(fontSizeOf(stateOf().font) * 0.6) * [...text].length,
    }),
    createLinearGradient: gradient,
    createRadialGradient: gradient,
    createPattern: (image) => ({ stops: [{ color: 'transparent' }], image }),
    getImageData: (x, y, width, height) => {
      const out = createPixelCanvas(width, height);

      out.getContext('2d').drawImage(canvas, x, y, width, height, 0, 0, width, height);

      return { width, height, data: out.data };
    },
    putImageData: (image, x, y) => {
      for (let row = 0; row < image.height; row += 1) {
        const line = image.data.subarray(row * image.width * 4, (row + 1) * image.width * 4);

        canvas.data.set(line, ((y + row) * canvas.width + x) * 4);
      }
    },
    createImageData: (width, height) => ({
      width,
      height,
      data: new Uint8ClampedArray(width * height * 4),
    }),
  };
}

function transformMethods(stack, holder) {
  return {
    save: () => stack.push({ ...holder.state }),
    restore: () => {
      holder.state = stack.pop() ?? holder.state;
    },
    translate: (x, y) => {
      holder.state.offsetX += x * holder.state.scaleX;
      holder.state.offsetY += y * holder.state.scaleY;
    },
    scale: (x, y) => {
      holder.state.scaleX *= x;
      holder.state.scaleY *= y;
    },
    setTransform: (...[scaleX = 1, , , scaleY = 1, offsetX = 0, offsetY = 0]) =>
      Object.assign(holder.state, { scaleX, scaleY, offsetX, offsetY }),
    resetTransform: () =>
      Object.assign(holder.state, { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 }),
  };
}

function createContext(canvas) {
  const holder = { state: freshState() };
  const stateOf = () => holder.state;
  const painter = createPainter(canvas, stateOf);
  const paths = { list: [] };
  const context = {
    canvas,
    ...transformMethods([], holder),
    ...pathMethods(painter, paths),
    ...paintMethods({ canvas, painter, paths, stateOf }),
    ...imageMethods(canvas, stateOf),
  };

  context.strokeRect = (x, y, width, height) => {
    context.beginPath();
    context.rect(x, y, width, height);
    context.stroke();
  };

  return new Proxy(context, {
    get: (target, name) => (name in target ? target[name] : holder.state[name]),
    set: (_, name, value) => {
      holder.state[name] = value;

      return true;
    },
  });
}

export function createPixelCanvas(width, height) {
  const canvas = { width, height, data: new Uint8ClampedArray(width * height * 4) };
  let context = null;

  canvas.getContext = () => {
    context ??= createContext(canvas);

    return context;
  };
  canvas.toPng = () => encodePng(canvas);

  return canvas;
}
