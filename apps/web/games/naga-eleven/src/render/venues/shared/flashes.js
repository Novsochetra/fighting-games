import { UI_SCALE, WORLD_VIEW } from '../../../config.js';
import { hash2 } from '../kit/hash.js';

// cameras flashing all round the stands, more when the crowd is up; each flash lasts two ticks and
// lands where the tick says, so a replay flashes the same
// `many` is for a view of the HUD's width; the world's wider view flashes as thickly
export function drawFlashes(context, { band, mood, colour, many = 6 }) {
  const spread = many * UI_SCALE;
  const calm = mood.excited ? spread : Math.ceil(spread / 3);
  const count = mood.cheer ? spread * 3 : calm;
  const beat = mood.tick >> 1;

  context.fillStyle = colour;

  for (let i = 0; i < count; i += 1) {
    const x = Math.floor(hash2(beat, i, 71) * WORLD_VIEW.width);
    const y = Math.round(band.top + hash2(beat, i, 72) * (band.bottom - band.top));

    context.fillRect(x, y, 1, 1);

    if (hash2(beat, i, 73) < 0.4) {
      context.fillRect(x - 1, y, 3, 1);
      context.fillRect(x, y - 1, 1, 3);
    }
  }
}
