import { VIEW_WIDTH } from '../../config.js';
import { spikeFrame } from '../../sim/hazards/spike-beat.js';
import { drawFxFrame } from '../fx/fx-sheets.js';

const MARGIN = 24;

// the tiles lie in the road, each showing where it is in its beat
export function drawSpikeTraps(painter, sheets, { spikeTraps, cameraX }) {
  for (const tile of spikeTraps) {
    if (tile.x > cameraX - MARGIN && tile.x < cameraX + VIEW_WIDTH + MARGIN) {
      const frame = spikeFrame(tile.time);

      drawFxFrame(painter, sheets, { name: 'spikeTrap', frame, x: tile.x, y: tile.y });
    }
  }
}
