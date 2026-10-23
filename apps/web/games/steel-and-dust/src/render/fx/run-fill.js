// rects laid one after another along a band are joined while each carries on the last along its row
// or its column, so a long band of light costs a few fills rather than one a screen pixel
const continuesRow = (run, rect) =>
  rect.y === run.y &&
  rect.height === run.height &&
  (rect.x === run.x + run.width || rect.x + rect.width === run.x);

const continuesColumn = (run, rect) =>
  rect.x === run.x &&
  rect.width === run.width &&
  (rect.y === run.y + run.height || rect.y + rect.height === run.y);

function join(run, rect) {
  const row = continuesRow(run, rect);
  return {
    x: Math.min(run.x, rect.x),
    y: Math.min(run.y, rect.y),
    width: row ? run.width + rect.width : run.width,
    height: row ? run.height : run.height + rect.height,
  };
}

export function createRunFill(context) {
  let run = null;
  const flush = () => {
    if (run) {
      context.fillRect(run.x, run.y, run.width, run.height);
    }
    run = null;
  };
  const add = (x, y, width, height) => {
    if (width <= 0 || height <= 0) {
      return;
    }
    const rect = { x, y, width, height };
    if (run && (continuesRow(run, rect) || continuesColumn(run, rect))) {
      run = join(run, rect);
      return;
    }
    flush();
    run = rect;
  };
  return { add, flush };
}
