import { VIEW_HEIGHT, VIEW_WIDTH } from '../../config.js';
import { WIPE_TICKS } from '../../data/mission-handoff.js';
import { isLastMission } from '../../data/missions/index.js';
import { clamp, easeInOutCubic } from '../../lib/math.js';
import { CLEAR_TICKS, REVEAL_FRAMES } from '../../sim/stage/stage-clear.js';

export const WIPE_CELL = 24;
const COLUMNS = VIEW_WIDTH / WIPE_CELL;
const ROWS = VIEW_HEIGHT / WIPE_CELL;
// the wave runs down as well as across, so it sweeps the screen on a slant
const SLANT = 0.5;
const LAST_ORDER = COLUMNS - 1 + (ROWS - 1) * SLANT;
// how many cells' widths the wave's front spreads over, as a share of the screen
const SPREAD = 0.9;
// every size divides the view, so the blocks tile it exactly
const MOSAIC_BLOCKS = [1, 2, 3, 4, 6, 8, 12];

// the wipe closes over the cleared road just as the next mission starts, and that one opens out of
// it, so the change of road is never seen; the last mission stays lit behind the All clear
export function missionWipe({ clearTime, missionIndex, fadeIn }) {
  if (fadeIn > 0) {
    return { closing: false, progress: 1 - (fadeIn - 1) / (REVEAL_FRAMES - 1) };
  }
  if (!clearTime || isLastMission(missionIndex)) {
    return null;
  }
  const progress = (clearTime - (CLEAR_TICKS - WIPE_TICKS)) / WIPE_TICKS;
  return progress > 0 ? { closing: true, progress: Math.min(1, progress) } : null;
}

// the share of the screen the wipe hides
export function wipeCover({ closing, progress }) {
  return closing ? progress : 1 - progress;
}

// a cell's cover as the wave passes it; the wave runs the same way out of a road and into the next
function cellCover({ closing, progress }, order) {
  const reached = clamp(progress * (1 + SPREAD) - order * SPREAD, 0, 1);
  return closing ? reached : 1 - reached;
}

// the diamond over each cell the wave has reached, grown to cover its whole cell
export function wipeCells(wipe) {
  const cells = [];
  for (let row = 0; row < ROWS; row++) {
    for (let column = 0; column < COLUMNS; column++) {
      const cover = cellCover(wipe, (column + row * SLANT) / LAST_ORDER);
      const radius = Math.round(easeInOutCubic(cover) * WIPE_CELL);
      if (radius > 0) {
        const x = column * WIPE_CELL + WIPE_CELL / 2;
        cells.push({ x, y: row * WIPE_CELL + WIPE_CELL / 2, radius });
      }
    }
  }
  return cells;
}

// the road breaks up into ever bigger blocks as the wipe closes over it, and back as it opens
export function mosaicBlock(wipe) {
  const step = Math.floor(wipeCover(wipe) * MOSAIC_BLOCKS.length);
  return MOSAIC_BLOCKS[Math.min(step, MOSAIC_BLOCKS.length - 1)];
}
