import { grainOf, toneIndex } from '../ground/grass.js';
import { bayer, noiseOf } from '../kit/hash.js';

const patches = noiseOf(24, 14);

// a pitch played on hard, worn to sand in the goalmouths and round the centre spot, where the boots
// go most; elsewhere it is the grass it was given
function wearOf(x, y, { pitch }) {
  const mouth = Math.max(
    0,
    1 - Math.min(x, pitch.length - x) / 110 - Math.abs(y - pitch.width / 2) / 170,
  );
  const centre = Math.max(
    0,
    1 - Math.hypot(x - pitch.length / 2, (y - pitch.width / 2) * 1.4) / 120,
  );

  return mouth + centre * 0.7;
}

export function wornGoalmouths(layout, art, grass, { amount = 0.9 } = {}) {
  return (x, y, column, row) => {
    const worn = wearOf(x, y, layout) * amount + patches(x, y) * 0.6 - 0.62;

    if (worn + (bayer(column, row) - 0.5) * 0.2 > 0) {
      return art.sand[toneIndex(3 + grainOf(column, row) * 0.6 - worn, column, row, art.sand)];
    }

    return grass(x, y, column, row);
  };
}
