import { VIEW_WIDTH } from '../../config.js';
import { SPIKE_TRAP } from '../../data/spike-traps.js';
import { spikeFrame } from '../../sim/hazards/spike-beat.js';
import { drawFxFrame } from '../fx/fx-sheets.js';

const MARGIN = 24;
// the sheet holds the tile's beat four times over: alone, then as the left end of a row, its
// middle and its right end, joined to the tiles beside it in one slab
const PHASES = 5;
const KINDS = { alone: 0, leftEnd: 1, middle: 2, rightEnd: 3 };

const besideIt = (tiles, tile, side) =>
  tiles.some(
    (other) => other.y === tile.y && Math.abs(other.x - (tile.x + side * SPIKE_TRAP.pitch)) < 1,
  );

export function tileKind(tiles, tile) {
  const left = besideIt(tiles, tile, -1);
  const right = besideIt(tiles, tile, 1);

  if (left && right) {
    return KINDS.middle;
  }

  if (right) {
    return KINDS.leftEnd;
  }

  return left ? KINDS.rightEnd : KINDS.alone;
}

// the tiles lie in the road, each showing where it is in its beat
export function drawSpikeTraps(painter, sheets, { spikeTraps, cameraX }) {
  for (const tile of spikeTraps) {
    if (tile.x > cameraX - MARGIN && tile.x < cameraX + VIEW_WIDTH + MARGIN) {
      const frame = spikeFrame(tile.time) + tileKind(spikeTraps, tile) * PHASES;

      drawFxFrame(painter, sheets, { name: 'spikeTrap', frame, x: tile.x, y: tile.y });
    }
  }
}
