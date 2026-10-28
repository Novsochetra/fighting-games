import { VIEW_WIDTH } from '../../config.js';
import { FX_SCALE, FX_SPRITES } from '../../data/fx-sprites.js';
import { SPIKE_TRAP } from '../../data/spike-traps.js';
import { spikeFrame } from '../../sim/hazards/spike-beat.js';
import { drawFxFrame } from '../fx/fx-sheets.js';

const MARGIN = 24;
// the sheet holds the tile's beat four times over: alone, then as the left end of a row, its
// middle and its right end, joined to the tiles beside it in one slab
const PHASES = 5;
const KINDS = { alone: 0, leftEnd: 1, middle: 2, rightEnd: 3 };
const FLAT = 0;
const { frameWidth, anchorX, anchorY } = FX_SPRITES.spikeTrap;

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

const onScreen = (tile, cameraX) =>
  tile.x > cameraX - MARGIN && tile.x < cameraX + VIEW_WIDTH + MARGIN;

function drawTile(painter, sheets, { spikeTraps, tile }) {
  const frame = spikeFrame(tile.time) + tileKind(spikeTraps, tile) * PHASES;

  drawFxFrame(painter, sheets, { name: 'spikeTrap', frame, x: tile.x, y: tile.y });
}

// the tiles lie in the road, each showing where it is in its beat
export function drawSpikeTraps(painter, sheets, { spikeTraps, cameraX }) {
  for (const tile of spikeTraps) {
    if (onScreen(tile, cameraX)) {
      drawTile(painter, sheets, { spikeTraps, tile });
    }
  }
}

// the fighters walk the tiles' far edge, behind both rows of slots, so what stands up out of them
// over the road line, the spikes and the warning's dust, is drawn again over the fighters
export function drawSpikesOver(painter, sheets, { spikeTraps, cameraX }) {
  const context = painter.context;

  for (const tile of spikeTraps) {
    if (!onScreen(tile, cameraX) || spikeFrame(tile.time) === FLAT) {
      continue;
    }

    const top = tile.y - anchorY * FX_SCALE;

    context.save();
    context.beginPath();
    context.rect(tile.x - anchorX * FX_SCALE, top, frameWidth * FX_SCALE, tile.y - top);
    context.clip();
    drawTile(painter, sheets, { spikeTraps, tile });
    context.restore();
  }
}
