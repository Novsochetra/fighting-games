import { swayLines } from './held-sway.js';
import { drawLayerSpan } from './layer-spans.js';
import { planOf } from './sway-blocks.js';
import { swayLayout } from './sway-layout.js';
import { freshMemory, swayMemory } from './sway-memory.js';

const STILL = { x: 0, y: 0 };

// the patch's moved parts (and its still ones too, with `keepStill`), as blocks of rows whose runs
// are all alike, each laid in one piece; worked out again only once a part of the trees has moved
// since they last were, or the patch has moved on the screen
export function swayPlan(patch) {
  const lines = swayLines(patch.sources);
  const span = lines[0].length - 1;
  const memory = patch.owner
    ? swayMemory(patch.owner, patch.sources, lines)
    : freshMemory(patch.sources, span);
  const layout = swayLayout(patch, { memory, lines });

  if (!layout.plan || layout.at < memory.changedAt) {
    layout.plan = planOf(patch, layout);
    layout.at = span;
  }

  return layout.plan;
}

export const swayBlocks = (patch) => swayPlan(patch).blocks;

function spanOf(block, run, { cameraX, shake, moves }) {
  const { x, width } = run;

  return {
    cameraX,
    shake,
    x,
    y: block.y,
    width,
    height: block.height,
    dx: moves ? run.dx : 0,
    dy: moves ? run.dy : 0,
  };
}

// every moved part has the far plate laid back under it, then every nearer layer, the one the
// patch moves moved; all of it on the still screen, so a shaking screen never splits it from the
// trees round it. The parts of the patch never overlap, so each layer is laid over all of them
// before the next, a still one in as few pieces as the moved parts touching each other make
export function drawSwayPatch(context, patch, { layers, cameraX, shake }) {
  const [far] = layers;
  const { blocks, stills } = swayPlan(patch);

  layers.forEach((layer, index) => {
    const shaken = index > 0 && layer.parallax > far.parallax;
    const moves = index > 0 && patch.moves(layer);
    const scene = { cameraX, shake: shaken ? shake : STILL, moves };

    for (const block of moves ? blocks : stills) {
      for (const run of moves ? block.runs : block.spans) {
        drawLayerSpan(context, layer, spanOf(block, run, scene));
      }
    }
  });
}

// one layer of the patch alone, moved as the patch moves it, laid over whatever is drawn there
export function drawSwayedLayer(context, layer, patch, { cameraX, shake }) {
  for (const block of swayBlocks(patch)) {
    for (const run of block.runs) {
      drawLayerSpan(context, layer, spanOf(block, run, { cameraX, shake, moves: true }));
    }
  }
}
