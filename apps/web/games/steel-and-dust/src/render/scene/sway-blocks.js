import { lastOf } from '../../lib/lists.js';

// one band of the patch in runs of columns moved by the same whole pixels; a part that gives less
// moves less, so a stalk or a vine is bent, never torn, and the still parts are left as drawn
function bandRuns(patch, band, groups) {
  const runs = [];

  groups.forEach(({ from, width }, i) => {
    const { sway, sag } = band.mixes[i];
    const dx = sway.offset;
    const dy = sag.offset;
    const last = lastOf(runs);
    const x = patch.left + from;

    if (last && last.dx === dx && last.dy === dy && last.x + last.width === x) {
      last.width += width;
    } else if (dx || dy || patch.keepStill) {
      runs.push({ x, width, dx, dy });
    }
  });

  return runs;
}

const sameRuns = (runs, others) =>
  runs.length === others.length &&
  runs.every(
    (run, i) =>
      run.x === others[i].x &&
      run.width === others[i].width &&
      run.dx === others[i].dx &&
      run.dy === others[i].dy,
  );

// the runs of a block that touch, joined, so a layer laid back still takes as few pieces as it can
function stillSpans(runs) {
  const spans = [];

  for (const { x, width } of runs) {
    const last = lastOf(spans);

    if (last && last.x + last.width === x) {
      last.width += width;
    } else {
      spans.push({ x, width, dx: 0, dy: 0 });
    }
  }

  return spans;
}

function blocksOf(patch, { groups, bands }) {
  const blocks = [];

  for (const band of bands) {
    const runs = bandRuns(patch, band, groups);
    const block = lastOf(blocks);

    if (block && block.y + block.height === band.y && sameRuns(block.runs, runs)) {
      block.height += band.height;
    } else if (runs.length) {
      blocks.push({ y: band.y, height: band.height, runs, spans: stillSpans(runs) });
    }
  }

  return blocks;
}

const sameSpans = (spans, others) =>
  spans.length === others.length &&
  spans.every((span, i) => span.x === others[i].x && span.width === others[i].width);

// blocks of rows whose moved parts cover the same columns, however far each is moved, joined
// down the patch, so a layer laid back still takes as few pieces as it can there too
function stillBlocks(blocks) {
  const stills = [];

  for (const { y, height, spans } of blocks) {
    const last = lastOf(stills);

    if (last && last.y + last.height === y && sameSpans(last.spans, spans)) {
      last.height += height;
    } else {
      stills.push({ y, height, spans });
    }
  }

  return stills;
}

// how the patch is laid, now: its blocks of moved parts, and the blocks a still layer is laid
// back in under and over them
export function planOf(patch, layout) {
  const blocks = blocksOf(patch, layout);

  return { blocks, stills: stillBlocks(blocks) };
}
