// A 2D context that keeps its transform the way a canvas does and notes every draw that cannot land
// on whole device pixels. A canvas smooths a fill or an image whose edge falls between pixels, any
// shape drawn turned by other than a quarter turn, every path, gradient and blur, whatever
// imageSmoothingEnabled says; pixel art drawn in code has to stay clear of all of them
const NEAR = 1e-6;
const isWhole = (value) => Math.abs(value - Math.round(value)) < NEAR;
const isZero = (value) => Math.abs(value) < 1e-12;
const SMOOTH_SHAPES = [
  'moveTo',
  'lineTo',
  'arc',
  'arcTo',
  'ellipse',
  'quadraticCurveTo',
  'bezierCurveTo',
  'roundRect',
  'fill',
  'stroke',
  'strokeRect',
  'fillText',
  'strokeText',
  'createLinearGradient',
  'createRadialGradient',
  'createConicGradient',
  'createPattern',
];

function createMatrix() {
  let matrix = [1, 0, 0, 1, 0, 0];
  const at = (x, y) => [
    matrix[0] * x + matrix[2] * y + matrix[4],
    matrix[1] * x + matrix[3] * y + matrix[5],
  ];
  // [scaleX, skewY, skewX, scaleY, moveX, moveY], as a canvas's transform() takes them
  const times = ([scaleX, skewY, skewX, scaleY, moveX, moveY]) => {
    const [ma, mb, mc, md, me, mf] = matrix;
    matrix = [
      ma * scaleX + mc * skewY,
      mb * scaleX + md * skewY,
      ma * skewX + mc * scaleY,
      mb * skewX + md * scaleY,
      ma * moveX + mc * moveY + me,
      mb * moveX + md * moveY + mf,
    ];
  };
  return {
    at,
    times,
    get: () => [...matrix],
    set: (values) => {
      matrix = [...values];
    },
    // only a matrix that keeps a rect a rect keeps its edges on device pixels
    keepsRects: () =>
      (isZero(matrix[1]) && isZero(matrix[2])) || (isZero(matrix[0]) && isZero(matrix[3])),
  };
}

function imageBox(image, args) {
  if (args.length === 2) {
    return [...args, image.width, image.height];
  }
  return args.length === 4 ? args : args.slice(4);
}

export function createGridContext() {
  const matrix = createMatrix();
  const misses = [];
  const saved = [];
  const clips = [];
  const counts = { draws: 0 };
  const miss = (what) => misses.push(what);
  const checkBox = (name, [x, y, width, height]) => {
    counts.draws++;
    const corners = [...matrix.at(x, y), ...matrix.at(x + width, y + height)];
    if (!matrix.keepsRects()) {
      miss(`${name}(${x},${y},${width},${height}) turned off the pixel grid`);
    } else if (!corners.every(isWhole)) {
      miss(`${name}(${x},${y},${width},${height}) between pixels`);
    }
  };
  const methods = {
    save: () => saved.push(matrix.get()),
    restore: () => saved.length && matrix.set(saved.pop()),
    setTransform: (...values) => matrix.set(values),
    resetTransform: () => matrix.set([1, 0, 0, 1, 0, 0]),
    transform: (...values) => matrix.times(values),
    translate: (x, y) => matrix.times([1, 0, 0, 1, x, y]),
    scale: (x, y) => matrix.times([x, 0, 0, y, 0, 0]),
    rotate: (angle) => {
      miss(`rotate(${angle})`);
      matrix.times([Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), 0, 0]);
    },
    fillRect: (...box) => checkBox('fillRect', box),
    drawImage: (image, ...args) => checkBox('drawImage', imageBox(image, args)),
    beginPath: () => clips.splice(0),
    rect: (...box) => clips.push({ box, transform: matrix.get() }),
    clip: () => {
      const current = matrix.get();
      for (const { box, transform } of clips) {
        matrix.set(transform);
        checkBox('clip', box);
      }
      matrix.set(current);
    },
  };
  for (const name of SMOOTH_SHAPES) {
    methods[name] = (...args) => {
      miss(`${name}(${args.join(',')})`);
      return { addColorStop: () => {} };
    };
  }
  const state = { globalAlpha: 1, fillStyle: '#000000', imageSmoothingEnabled: false };
  const context = new Proxy(state, {
    get: (target, name) => methods[name] ?? (name in target ? target[name] : () => {}),
    set(target, name, value) {
      const smooths =
        (name === 'shadowBlur' && value > 0) ||
        (name === 'filter' && value !== 'none') ||
        (name === 'imageSmoothingEnabled' && value);
      if (smooths) {
        miss(`${name}=${value}`);
      }
      target[name] = value;
      return true;
    },
  });
  return { context, misses, counts };
}
