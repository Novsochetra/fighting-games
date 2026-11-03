import { WORLD_VIEW } from '../../../config.js';
import { rasterToCanvas } from '../kit/canvas.js';
import { createRaster } from '../kit/raster.js';
import { paintGoalBack, paintGoalFront } from './paint.js';
import { rippleOf } from './ripple.js';
import { goalShape, pointOf } from './shape.js';

// room round the frame for the net to bulge into
const MARGIN = 18;
const STILL = 'still';

function cornersOf(camera, shape) {
  return [shape.line, shape.back].flatMap((x) =>
    [shape.far, shape.near].flatMap((y) =>
      [0, shape.height].map((lift) => pointOf(camera, shape, { x, y, z: lift })),
    ),
  );
}

function boxOf(corners) {
  const xs = corners.map((point) => point.x);
  const ys = corners.map((point) => point.y);
  const left = Math.min(...xs) - MARGIN;
  const top = Math.min(...ys) - MARGIN;

  return {
    left,
    top,
    width: Math.max(...xs) + MARGIN - left,
    height: Math.max(...ys) + MARGIN - top,
  };
}

const keyOf = (corners, box, ripple) =>
  `${corners.map((point) => `${point.x - box.left},${point.y - box.top}`).join(';')}|${ripple && ripple.age < 70 ? ripple.age : STILL}`;

// the last drawing's canvases are painted over again when the goal keeps its size, so a camera on
// the move makes no new canvas a frame
function paintBoth(scene, { shape, ripple, box, style }, last) {
  const origin = { x: box.left, y: box.top };
  const job = { camera: scene.camera, shape, ripple, origin, style };
  const back = createRaster(box.width, box.height);
  const front = createRaster(box.width, box.height);
  const sameSize = last && last.width === box.width && last.height === box.height;

  paintGoalBack(back, job);
  paintGoalFront(front, job);

  return {
    width: box.width,
    height: box.height,
    back: rasterToCanvas(back, scene.createCanvas, sameSize ? last.back : null),
    front: rasterToCanvas(front, scene.createCanvas, sameSize ? last.front : null),
  };
}

// a goal is painted again only when the camera has turned it to a new shape or its net is moving
function goalArt(scene, end, job) {
  const cache = (scene.layers.goals ??= []);
  const key = keyOf(job.corners, job.box, job.ripple);

  if (cache[end]?.key !== key) {
    cache[end] = { key, ...paintBoth(scene, job, cache[end]) };
  }

  return cache[end];
}

function drawablesAt(scene, end, style) {
  const shape = goalShape(scene.layers.layout, end, style.shape);
  const corners = cornersOf(scene.camera, shape);
  const box = boxOf(corners);

  if (
    box.left > WORLD_VIEW.width ||
    box.left + box.width < 0 ||
    box.top > WORLD_VIEW.height ||
    box.top + box.height < 0
  ) {
    return [];
  }

  const ripple = rippleOf(scene.match, end, scene.tick);
  const art = goalArt(scene, end, { shape, ripple, box, corners, style });
  const lay = (canvas) => (context) => canvas && context.drawImage(canvas, box.left, box.top);

  return [
    { depth: shape.far, draw: lay(art.back) },
    { depth: shape.near, draw: lay(art.front) },
  ];
}

export function goalDrawables(scene) {
  const style = scene.layers.parts.goal;

  return style ? [0, 1].flatMap((end) => drawablesAt(scene, end, style)) : [];
}
