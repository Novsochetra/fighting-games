import { GIVE_STEPS, playMix, stillMix, swayLines } from './held-sway.js';
import { drawLayerSpan } from './layer-spans.js';
import { mixesFor } from './sway-memory.js';

const STILL = { x: 0, y: 0 };

// each raider's give at every column of the patch: none outside its own stretch of the trees
function columnGives(patch) {
  const width = patch.right - patch.left;

  return patch.sources.map((source) => {
    const gives = new Float64Array(width);

    for (let i = 0; i < width; i++) {
      const x = patch.left + i;

      gives[i] = x >= source.left && x < source.right ? source.across(x) : 0;
    }

    return gives;
  });
}

// runs of columns every raider gives alike, worked out once a row for the whole run
function columnGroups(columns, width) {
  const groups = [];

  for (let i = 0; i < width; i++) {
    const last = groups.at(-1);

    if (last && columns.every((gives) => gives[i] === gives[last.from])) {
      last.width++;
    } else {
      groups.push({ from: i, width: 1 });
    }
  }

  return groups;
}

const rowGive = (source, y) => (y >= source.top && y < source.bottom ? source.down(y) : 0);

// how far a pixel of the patch is moved, by how much it gives to each raider in the trees; a mix
// of gives is played once a frame, however many pixels share it. Written into `moved`, as this
// runs for every pixel of the patch
function offsetInto(moved, { columns, downs, lines, known }, i) {
  let key = 0;

  for (let source = 0; source < columns.length; source++) {
    key = key * (GIVE_STEPS + 1) + Math.round(columns[source][i] * downs[source] * GIVE_STEPS);
  }

  if (!known.has(key)) {
    const steps = columns.map((gives, source) => Math.round(gives[i] * downs[source] * GIVE_STEPS));

    known.set(key, playMix(stillMix(steps), lines, 0));
  }

  const { sway, sag } = known.get(key);

  moved.dx = sway.offset;
  moved.dy = sag.offset;
}

// one row of the patch in runs of columns moved by the same whole pixels; a part that gives less
// moves less, so a stalk or a vine is bent, never torn, and the still parts are left as drawn
function rowRuns(patch, row) {
  const runs = [];
  const moved = { dx: 0, dy: 0 };

  for (const { from, width } of row.groups) {
    offsetInto(moved, row, from);
    const { dx, dy } = moved;
    const last = runs.at(-1);
    const x = patch.left + from;

    if (last && last.dx === dx && last.dy === dy && last.x + last.width === x) {
      last.width += width;
    } else if (dx || dy || patch.keepStill) {
      runs.push({ x, width, dx, dy });
    }
  }

  return runs;
}

const keyOf = (runs) => runs.map(({ x, width, dx, dy }) => `${x},${width},${dx},${dy}`).join(' ');
const sameGive = (downs, last) => downs.every((down, i) => down === last[i]);

// the patch's moved parts (and its still ones too, with `keepStill`), as blocks of rows whose runs
// are all alike, each laid in one piece; a row that gives as much as the one above it is moved as
// it is, without working it out again
export function swayBlocks(patch) {
  const columns = columnGives(patch);
  const groups = columnGroups(columns, patch.right - patch.left);
  const lines = swayLines(patch.sources);
  const known = patch.owner ? mixesFor(patch.owner, patch.sources, lines) : new Map();
  const shared = { columns, groups, lines, known };
  const blocks = [];
  let last = { downs: [], runs: [], key: '' };

  for (let y = patch.top; y < patch.bottom; y++) {
    const downs = patch.sources.map((source) => rowGive(source, y));
    const runs = sameGive(downs, last.downs) ? last.runs : rowRuns(patch, { ...shared, downs });
    const key = runs === last.runs ? last.key : keyOf(runs);
    const block = blocks.at(-1);

    if (block && block.key === key && block.y + block.height === y) {
      block.height++;
    } else if (runs.length) {
      blocks.push({ y, height: 1, runs, key });
    }

    last = { downs, runs, key };
  }

  return blocks;
}

function spanOf(block, run, { cameraX, shake, moved }) {
  const { x, width } = run;

  return { cameraX, shake, x, y: block.y, width, height: block.height, ...moved };
}

// every moved part has the far plate laid back under it, then every nearer layer, the one the
// patch moves moved; all of it on the still screen, so a shaking screen never splits it from the
// trees round it
export function drawSwayPatch(context, patch, { layers, cameraX, shake }) {
  const [far] = layers;

  for (const block of swayBlocks(patch)) {
    for (const run of block.runs) {
      layers.forEach((layer, index) => {
        const shaken = index > 0 && layer.parallax > far.parallax;
        const moves = index > 0 && patch.moves(layer);
        const moved = moves ? { dx: run.dx, dy: run.dy } : { dx: 0, dy: 0 };
        const span = spanOf(block, run, { cameraX, shake: shaken ? shake : STILL, moved });

        drawLayerSpan(context, layer, span);
      });
    }
  }
}

// one layer of the patch alone, moved as the patch moves it, laid over whatever is drawn there
export function drawSwayedLayer(context, layer, patch, { cameraX, shake }) {
  for (const block of swayBlocks(patch)) {
    for (const run of block.runs) {
      const moved = { dx: run.dx, dy: run.dy };

      drawLayerSpan(context, layer, spanOf(block, run, { cameraX, shake, moved }));
    }
  }
}
