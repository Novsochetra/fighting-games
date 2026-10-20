import { emitterSpots } from './emitters.js';
import { isOnScreen } from './motion.js';

const COLUMN = 2;
const SWALLOWTAIL = 0.78;

// a pennant flies from its pole at the emitter's left: each column rides a wave that runs out
// along the cloth, so the tail flutters most, and the tail is split into a swallowtail
function columnAt(spot, { column, columns, effect, tick }) {
  const along = column / columns;
  const phase = tick * 0.12 - column * 0.5 + spot.index * 1.9;
  const height = Math.max(2, Math.round(effect.height * (1 - along * 0.4)));
  const split = Math.max(0, (along - SWALLOWTAIL) / (1 - SWALLOWTAIL));
  return {
    x: spot.x - (columns * COLUMN) / 2 + column * COLUMN,
    y: spot.y + Math.round(Math.sin(phase) * along * effect.flutter + along * effect.droop),
    height,
    notch: Math.round(split * height * 0.7),
    tilt: Math.cos(phase),
  };
}

// the face turned toward the light is lighter, the one turned away darker
function shadeOf(tilt, [, dark, body, light]) {
  if (tilt > 0.45) {
    return light;
  }
  return tilt < -0.45 ? dark : body;
}

// a column of the swallowtail is two prongs with the notch between them
function drawColumn(painter, slice, colors) {
  painter.use(shadeOf(slice.tilt, colors));
  if (slice.notch > 0) {
    const upper = Math.ceil((slice.height - slice.notch) / 2);
    const lower = slice.height - slice.notch - upper;
    painter.rect(slice.x, slice.y, COLUMN, upper);
    painter.rect(slice.x, slice.y + slice.height - lower, COLUMN, lower);
  } else {
    painter.rect(slice.x, slice.y, COLUMN, slice.height);
  }
  painter.use(colors[0]).rect(slice.x, slice.y - 1, COLUMN, 1);
  painter.rect(slice.x, slice.y + slice.height, COLUMN, 1);
}

export function drawPennants(painter, { effect, tick, cameraX, colors }) {
  const columns = Math.round(effect.length / COLUMN);
  for (const spot of emitterSpots(effect, cameraX)) {
    for (let column = 0; column < columns; column++) {
      const slice = columnAt(spot, { column, columns, effect, tick });
      if (isOnScreen(slice.x, slice.y, Math.max(COLUMN, slice.height))) {
        drawColumn(painter, slice, colors.pennant);
      }
    }
  }
}
