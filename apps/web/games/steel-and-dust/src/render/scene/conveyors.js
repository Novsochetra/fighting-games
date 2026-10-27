import { VIEW_WIDTH } from '../../config.js';
import { mouthOf } from '../../data/conveyors.js';
import { FX_SPRITES } from '../../data/fx-sprites.js';
import { drawFxFrame } from '../fx/fx-sheets.js';
import {
  BELT_SINK,
  FURNACE_AHEAD,
  PLATES,
  beltPieces,
  plateSlots,
  plateSpan,
} from './conveyor-pieces.js';

const MARGIN = 48;

const inView = (belt, cameraX) =>
  belt.to + MARGIN > cameraX && belt.from - MARGIN < cameraX + VIEW_WIDTH;

// a spot `back` world px up the belt from its mouth
const upBelt = (belt, back) => mouthOf(belt) - belt.direction * back;

function drawPiece(painter, sheets, belt, { frame, back }) {
  const spot = { x: upBelt(belt, back), y: belt.y + BELT_SINK };

  drawFxFrame(painter, sheets, { name: 'conveyor', frame, ...spot, facing: belt.direction });
}

// only the plates move; the rollers, frame and legs under them stand still
function drawPlates(painter, sheets, belt, tick) {
  const { near, far } = plateSpan(belt);
  const ends = [upBelt(belt, near), upBelt(belt, far)];
  const [left, right] = [Math.min(...ends), Math.max(...ends)];
  const context = painter.context;

  context.save();
  context.beginPath();
  context.rect(left, belt.y + PLATES.top, right - left, PLATES.bottom - PLATES.top);
  context.clip();
  for (const slot of plateSlots(belt, tick)) {
    drawPiece(painter, sheets, belt, slot);
  }

  context.restore();
}

function drawFurnace(painter, sheets, belt, tick) {
  const { frames, ticks } = FX_SPRITES.furnaceMouth;
  const frame = Math.floor(tick / ticks) % frames;
  const x = upBelt(belt, -FURNACE_AHEAD);

  drawFxFrame(painter, sheets, {
    name: 'furnaceMouth',
    frame,
    x,
    y: belt.y,
    facing: belt.direction,
  });
}

export function drawConveyors(painter, sheets, { conveyors, cameraX, tick }) {
  for (const belt of conveyors) {
    if (!inView(belt, cameraX)) {
      continue;
    }

    for (const piece of beltPieces(belt)) {
      drawPiece(painter, sheets, belt, piece);
    }

    drawPlates(painter, sheets, belt, tick);
    drawFurnace(painter, sheets, belt, tick);
  }
}
