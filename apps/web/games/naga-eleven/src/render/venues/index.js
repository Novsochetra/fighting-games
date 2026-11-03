import { WORLD_VIEW } from '../../config.js';
import { viewOf } from '../camera.js';
import { venueLayers } from './cache.js';
import { VENUES } from './catalog.js';
import { crowdFrame, moodOf } from './crowd/mood.js';
import { defaultCanvas } from './kit/canvas.js';
import { drawBillboard } from './layers/billboard.js';
import { drawGround } from './layers/ground.js';
import { goalDrawables } from './goals/index.js';
import { propDrawables } from './props/drawables.js';

const FALLBACK = 'national-stadium';

function prepare(camera, match, { venue, tick = match.tick, createCanvas = defaultCanvas }) {
  const spec = VENUES[venue] ?? VENUES[FALLBACK];
  const layers = venueLayers(spec, camera, match, createCanvas);

  return { spec, layers, view: viewOf(camera), mood: moodOf(match, tick), tick, createCanvas };
}

function drawLayers(context, list, scene) {
  for (const layer of list) {
    const frame = layer.frames > 1 ? crowdFrame(scene.mood) % layer.frames : 0;

    drawBillboard(context, { canvas: layer.canvases[frame], frame: layer.frame }, scene.view);
  }
}

// the ground covers the view from its far edge down, so the sky's colour is laid only above it:
// on the world's big canvas a fill of the whole view is a phone's quarter of a frame
const skyRows = (scene) =>
  Math.min(
    WORLD_VIEW.height,
    Math.max(0, Math.round(scene.layers.ground.frame.rowTop + scene.view.top) + 2),
  );

// draws the venue in place of an empty view: the sky, the ground and all that stands behind it
export function drawVenue(context, camera, match, options = {}) {
  const scene = { ...prepare(camera, match, options), camera, match };

  context.imageSmoothingEnabled = false;
  context.fillStyle = scene.spec.sky;
  context.fillRect(0, 0, WORLD_VIEW.width, skyRows(scene));
  drawLayers(context, scene.layers.back, scene);
  drawGround(context, scene.layers.ground, scene.view);
  drawLayers(context, scene.layers.far, scene);
  scene.layers.parts.overlay?.(context, scene);
}

// what stands on the pitch with the players, each drawn in turn from the back: the goals, the flags
// at the corners and the people by the lines
export function venueDrawables(camera, match, options = {}) {
  const scene = { ...prepare(camera, match, options), camera, match };
  const props = propDrawables(scene, scene.layers.parts.props ?? []);

  return [...goalDrawables(scene), ...props].sort((first, second) => first.depth - second.depth);
}

// what stands between the camera and the pitch: the near boards or fence
export function drawVenueFront(context, camera, match, options = {}) {
  const scene = { ...prepare(camera, match, options), camera, match };

  drawLayers(context, scene.layers.near, scene);
  scene.layers.parts.front?.(context, scene);
}

// bakes a venue ahead of its first frame, while a scene or a menu is up, so the match never waits
export function prepareVenue(camera, match, options = {}) {
  prepare(camera, match, options);
}
