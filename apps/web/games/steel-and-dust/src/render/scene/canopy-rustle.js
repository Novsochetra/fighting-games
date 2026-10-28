import { smoothstep } from '../../lib/math.js';
import { canopyAcross } from './canopy-columns.js';
import { layerOrigin } from './layer-spans.js';
import { drawSwayPatch } from './sway-patch.js';

// a crown's patch reaches this far past its painted edge, so a leaf swaying out over the sky is
// still drawn; a crown leans more than it sinks
const CROWN_PAD = 4;
const CROWN_GIVE = { sway: 1.2, sag: 0.6 };
const CANOPY_GIVE = { sway: 1, sag: 1 };

// where a perch's layer lays a spot of its own on the screen, to the pixel the layer is drawn at
export function perchOnScreen(perch, layerX, cameraX) {
  return Math.round(layerX) + Math.round(-cameraX * perch.parallax);
}

// the trees round a drop in the road's canopy, down to its foot, where what hangs from the boughs
// has ended, or where a stalk is rooted
export function canopySource(mark, road) {
  const { canopy, cameraX } = road;
  const spotX = Math.round(mark.x - cameraX);
  const { across, half } = canopyAcross(road, spotX);

  return {
    layer: canopy.layer,
    left: spotX - half,
    right: spotX + half,
    top: 0,
    bottom: canopy.foot,
    across,
    down: (y) => smoothstep((canopy.foot - y) / canopy.fade),
    mark,
    time: mark.time,
    give: canopy.give ?? CANOPY_GIVE,
    // where the canopy's painting lies, which its trunks' and stalks' give is worked out from
    shape: layerOrigin(road.layer, cameraX),
  };
}

// the crown a raider hides in, in its own layer: it bends from where it meets the trunk, its top
// moving the most
export function crownSource(mark, { cameraX }) {
  const { perch } = mark;
  const { top, bottom } = perch;

  return {
    layer: perch.layer,
    left: perchOnScreen(perch, perch.from + perch.shift, cameraX) - CROWN_PAD,
    right: perchOnScreen(perch, perch.to + perch.shift, cameraX) + CROWN_PAD,
    top: top - CROWN_PAD,
    bottom,
    across: () => 1,
    down: (y) => smoothstep((bottom - y) / (bottom - top)),
    mark,
    time: mark.time,
    give: CROWN_GIVE,
    shape: 'crown',
  };
}

const isRustling = (shot) => shot.kind === 'dropMark' && shot.perch?.kind !== 'ledge';

function sourceOf(mark, { backdrop, cameraX }) {
  if (mark.perch) {
    return crownSource(mark, { cameraX });
  }

  const layer =
    backdrop.canopy && backdrop.layers.find((one) => one.name === backdrop.canopy.layer);

  return layer?.ready ? canopySource(mark, { canopy: backdrop.canopy, layer, cameraX }) : null;
}

// every raider waiting in the trees, and letting go of them, in one patch: where the trees two of
// them shake overlap they are moved once, by both
export function rustlePatch(game, scene) {
  const sources = game.projectiles
    .filter(isRustling)
    .map((mark) => sourceOf(mark, scene))
    .filter(Boolean);

  if (!sources.length) {
    return null;
  }

  return {
    left: Math.min(...sources.map((source) => source.left)),
    right: Math.max(...sources.map((source) => source.right)),
    top: Math.min(...sources.map((source) => source.top)),
    bottom: Math.max(...sources.map((source) => source.bottom)),
    sources,
    owner: scene.backdrop,
    moves: (layer) => layer.name === sources[0].layer,
  };
}

// the road's own painted trees sway over a raider about to drop out of them; drawn before the air,
// so light shafts, motes and mist still pass in front, and not at all with no raider in them, which
// keeps the recorded frames of the other roads unchanged
export function drawCanopyRustle(painter, setLayer, { game, backdrop, cameraX }) {
  const patch = backdrop.layers[0]?.ready && rustlePatch(game, { backdrop, cameraX });

  if (!patch) {
    return;
  }

  const layers = backdrop.layers.filter((layer) => layer.ready);

  setLayer(0, false);
  drawSwayPatch(painter.context, patch, { layers, cameraX, shake: setLayer.shake });
  setLayer(0, true);
}
