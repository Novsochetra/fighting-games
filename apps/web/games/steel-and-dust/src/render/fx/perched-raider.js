import { DROP } from '../../data/ambush.js';
import { ENEMY_SPRITES } from '../../data/enemies/enemy-sprites.js';
import { ENEMY_TYPES } from '../../data/enemies/enemy-types.js';
import { easeOutCubic } from '../../lib/math.js';
import { enemySheetReady } from '../fighters/enemy-sheets.js';
import { drawEnemyFrame } from '../fighters/enemy-sprites.js';
import { perchOnScreen } from '../scene/canopy-rustle.js';
import { CELL_HEIGHT, CELL_WIDTH, drawLayerCell } from '../scene/rustle-cells.js';

// it climbs up from this far below the ledge's edge, where the ledge hides it, so it comes up
// over the edge instead of appearing on it
const RISE = 44;
// half as wide as the widest raider's frame, and as tall as it stands, to clip it to the ledge
const REACH = 40;
const HEIGHT = 80;
// it breathes through its idle strip while it waits, then crouches to spring for the last ticks
const IDLE_TICKS = 9;
const CROUCH = 10;
const STILL = { x: 0, y: 0 };

function frameAt(mark, id) {
  if (mark.time >= DROP.warn - CROUCH) {
    return ['attack', 0];
  }

  const frames = ENEMY_SPRITES[id].strips.idle.frames;

  return ['idle', Math.floor(mark.time / IDLE_TICKS) % frames];
}

// a parapet's merlons stand in front of a raider on the walkway behind them: the wall's own pixels
// are laid back over it from the merlons' tops down to its feet, so it shows through the gaps;
// drawn on the screen's own pixels, shaken as the layer was
function drawWallOver(context, { perch, x, layer, cameraX }) {
  const screenX = x - cameraX;

  context.save();
  context.translate(cameraX, 0);
  for (let column = screenX - REACH; column < screenX + REACH; column += CELL_WIDTH) {
    for (let row = perch.wall; row <= perch.y; row += CELL_HEIGHT) {
      drawLayerCell(context, layer, { cameraX, shake: STILL, x: column, y: row, dx: 0, dy: 0 });
    }
  }

  context.restore();
}

function wallLayer(perch, backdrop) {
  return perch.wall && backdrop?.layers.find((layer) => layer.name === perch.layer && layer.ready);
}

// a raider on a ledge in sight before it leaps: up over the edge, waiting, looking down at the
// hero; anything of it below its feet is behind the ledge, so it is clipped there
export function drawPerchedRaider(painter, mark, { enemySheets, heroX, cameraX, backdrop }) {
  const id = ENEMY_TYPES[mark.raiderKind].sprite;

  if (!enemySheetReady(enemySheets, id)) {
    return;
  }

  const { perch } = mark;
  const x = perchOnScreen(perch, perch.layerX, cameraX) + cameraX;
  const layer = wallLayer(perch, backdrop);
  const climbed = easeOutCubic(Math.min(1, mark.time / DROP.climb));
  const { context } = painter;

  context.save();
  context.beginPath();
  context.rect(x - REACH, perch.y - HEIGHT, REACH * 2, HEIGHT);
  context.clip();
  drawEnemyFrame(painter, enemySheets, {
    id,
    frame: frameAt(mark, id),
    x,
    y: perch.y + RISE * (1 - climbed),
    facing: heroX >= x ? 1 : -1,
  });
  context.restore();
  if (layer) {
    drawWallOver(context, { perch, x, layer, cameraX });
  }
}
