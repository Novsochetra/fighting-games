import { FX_SPRITES } from '../../data/fx-sprites.js';
import { NEST } from '../../data/nests.js';
import { drawFxFrame } from '../fx/fx-sheets.js';
import { inView } from './nests.js';

// a hornet is drawn smaller than the sprites' density, so six of them read as a swarm about a body
const HORNET_SCALE = 0.5;
const { frames, ticks } = FX_SPRITES.hornet;
// a pair crawls and hovers about a nest still hanging, so it reads as a live one
const GUARDS = [0, Math.PI];
const GUARD_SPIN = 0.05;

function drawHornet(painter, sheets, { x, y, facing, beat }) {
  const frame = Math.floor(beat / ticks) % frames;

  drawFxFrame(painter, sheets, { name: 'hornet', frame, x, y, scale: HORNET_SCALE, facing });
}

function drawGuards(painter, sheets, nest, tick) {
  const middle = nest.y - NEST.hang + nest.drop - NEST.height / 2;

  GUARDS.forEach((phase, i) => {
    const angle = phase + tick * GUARD_SPIN;
    const x = nest.x + Math.cos(angle) * (NEST.halfWidth + 4);
    const y = middle + Math.sin(angle * 2) * 6;
    const facing = Math.sin(angle) > 0 ? -1 : 1;

    drawHornet(painter, sheets, { x, y, facing, beat: tick + i });
  });
}

export function drawHornets(painter, sheets, { nests, cameraX, tick }) {
  for (const nest of nests) {
    if (nest.state !== 'broken' && inView(nest, cameraX)) {
      drawGuards(painter, sheets, nest, tick);
    }

    (nest.swarm?.hornets ?? []).forEach((hornet, i) => {
      drawHornet(painter, sheets, { ...hornet, beat: tick + i });
    });
  }
}
