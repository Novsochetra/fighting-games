import { hash } from '../../../../../../src/render/duel/hash.js';
import { VIEW } from '../../world.js';
import { baked, stamp } from '../bake.js';
import { ditherAt, layerPen } from './layers.js';
import { SKY_BY_DUSK, STARS } from './palette.js';
import { STAND } from './stand-plan.js';

const BAND_FOOTS = [12, 40, 64, 82, 96, 106, STAND.roof + 2];

const SKY = { left: STAND.left, top: 0, width: STAND.right - STAND.left };

const TRANSITION = 4;

function paintBand(pen, { band, colours, width }) {
  const top = band === 0 ? 0 : BAND_FOOTS[band - 1];
  const foot = BAND_FOOTS[band];

  pen.rect([0, top, width, foot - top], colours[band]);

  if (band === 0) {
    return;
  }

  for (let row = 1; row <= TRANSITION; row += 1) {
    const share = (TRANSITION + 1 - row) / (TRANSITION + 1) / 2;

    for (let x = 0; x < width; x += 1) {
      if (ditherAt(x, top + row) < share) {
        pen.dot(x, top + row - 1, colours[band - 1]);
      }
    }
  }
}

function skyCanvas(dusk) {
  const colours = SKY_BY_DUSK[dusk];
  const height = BAND_FOOTS.at(-1);

  return baked(`stadium-sky-${dusk}`, {
    width: SKY.width,
    height,
    paint: (pen) =>
      colours.forEach((_, band) => paintBand(pen, { band, colours, width: SKY.width })),
  });
}

export function drawSky(context, { camera, dusk }) {
  const pen = layerPen(context, camera, 'stand');
  const canvas = skyCanvas(dusk);

  context.fillStyle = SKY_BY_DUSK[dusk][0];
  context.fillRect(0, 0, VIEW.width, VIEW.height);

  if (canvas) {
    stamp(pen, canvas, { left: SKY.left, top: SKY.top });

    return;
  }

  pen.rect([SKY.left, BAND_FOOTS[2], SKY.width, STAND.roof - BAND_FOOTS[2]], SKY_BY_DUSK[dusk][4]);
}

const STAR_COUNT = 70;

export function drawStars(context, { camera, frame }) {
  const pen = layerPen(context, camera, 'stars');

  for (let i = 0; i < STAR_COUNT; i += 1) {
    const x = 120 + Math.floor(hash(i, 71) * 560);
    const y = 8 + Math.floor(hash(i, 72) ** 1.4 * 100);
    const blink = hash(i, Math.floor((frame + i * 7) / 12), 73) < 0.12;
    const bright = hash(i, 74) < 0.16;

    pen.dot(x, y, blink ? STARS[0] : STARS[bright ? 1 : 0]);

    if (bright && !blink) {
      pen.rect([x - 1, y, 3, 1], STARS[0]);
      pen.rect([x, y - 1, 1, 3], STARS[0]);
      pen.dot(x, y, STARS[1]);
    }
  }
}
