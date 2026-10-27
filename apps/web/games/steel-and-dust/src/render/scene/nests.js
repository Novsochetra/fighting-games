import { VIEW_WIDTH } from '../../config.js';
import { NEST } from '../../data/nests.js';
import { drawFxFrame } from '../fx/fx-sheets.js';

const MARGIN = 48;
// a struck nest still hangs from its tree's branch (drawn with the tree), trembling under it
const FRAMES = { hanging: 0, struck: 0, falling: 1, broken: 2 };

export function nestFrame(nest) {
  return FRAMES[nest.state];
}

// a struck nest trembles on its branch before it tears loose
export function tremble(nest) {
  return nest.state === 'struck' ? ((nest.time >> 1) % 2) * 2 - 1 : 0;
}

export const inView = (nest, cameraX) =>
  nest.x > cameraX - MARGIN && nest.x < cameraX + VIEW_WIDTH + MARGIN;

export const hangingAt = (nest) => nest.y - NEST.hang;

function drawNest(painter, sheets, nest) {
  const x = nest.x + tremble(nest);
  const y = hangingAt(nest) + nest.drop;

  drawFxFrame(painter, sheets, { name: 'hornetNest', frame: nestFrame(nest), x, y });
}

export function drawNests(painter, sheets, { nests, cameraX }) {
  for (const nest of nests) {
    if (inView(nest, cameraX)) {
      drawNest(painter, sheets, nest);
    }
  }
}
