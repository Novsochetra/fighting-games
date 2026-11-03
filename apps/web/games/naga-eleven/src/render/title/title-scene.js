import { TITLE_ART } from '../../art/title/palette.js';
import { glow, mixes } from '../backdrops/dither.js';
import { paintAngkorWat } from '../backdrops/parts/angkor.js';
import { paintFigure } from '../backdrops/parts/figures.js';
import { paintNagaRail } from '../backdrops/parts/naga-stairs.js';
import { paintBall } from '../backdrops/parts/path.js';
import { paintSky, paintStars } from '../backdrops/parts/sky.js';
import { paintReflection } from '../backdrops/parts/water.js';
import { plot } from '../backdrops/raster.js';
import { paintHumps, paintNaga } from './naga.js';

// The title picture: dusk over Angkor, the great Naga rising gold and jade out of the moat, and
// a lone boy with a ball on the causeway looking up at it. The upper middle stays sky, for the
// name the title screen writes over it. Laid out from the buffer's size, so a wider share image
// is the same picture.
const art = TITLE_ART;

export const titleLayout = ({ width, height }) => {
  const horizon = Math.round(height * 0.7);

  return { width, height, horizon, center: Math.round(width / 2), heart: horizon - 38 };
};

function paintRays(raster, { center, heart, horizon }) {
  for (let y = 0; y < horizon; y += 1) {
    for (let x = 0; x < raster.width; x += 1) {
      const angle = Math.atan2(y - heart, x - center);
      const reach = Math.hypot(x - center, (y - heart) * 1.3);
      const inRay = Math.floor(((angle + Math.PI) * 14) / Math.PI) % 2 === 0;

      if (inRay && reach > 76 && mixes(x, y, 0.3 * (1 - reach / 230))) {
        plot(raster, x, y, art.rays[reach < 120 ? 2 : 1]);
      }
    }
  }
}

function paintCauseway(raster, { center, horizon, height }) {
  const stairs = {
    top: { y: horizon, left: center - 12, right: center + 12 },
    bottom: { y: height, left: center - 84, right: center + 84 },
  };

  for (let y = horizon; y < height; y += 1) {
    const share = (y - horizon) / (height - horizon);
    const half = 12 + share * 72;
    const joint = Math.round(share * 40) % 3 === 0;

    for (let x = Math.round(center - half); x <= center + half; x += 1) {
      const light = 1 - Math.abs(x - center) / half;

      plot(raster, x, y, art.stone[joint ? 2 : 3 + Math.round(light * 2 - share)]);
    }
  }

  paintNagaRail(raster, { stairs, side: -1, colors: art });
  paintNagaRail(raster, { stairs, side: 1, colors: art });
}

function paintBoy(raster, { center, height }) {
  const ground = height - 12;
  const toward = [
    { x: 0, y: -1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];

  paintFigure(raster, {
    x: center,
    ground,
    height: 40,
    pose: 'stand',
    build: 1.15,
    colors: art.boy,
    toward,
  });
  [-3, -1, 1, 3].forEach((spike, i) => {
    plot(raster, center + spike, ground - 41 - (i % 2), art.boy[0]);
    plot(raster, center + spike, ground - 42 - (i % 2), art.boy[1]);
  });
  paintBall(raster, { x: center + 10, y: ground - 3, radius: 3 }, art.ball);
}

export function paintTitle(raster) {
  const layout = titleLayout(raster);
  const { center, heart, horizon } = layout;

  paintSky(raster, { colors: art.sky, bottom: horizon + 1, edge: 0.5 });
  paintStars(raster, { count: 46, bottom: Math.round(horizon * 0.5), colors: art.stars, seed: 5 });
  paintRays(raster, layout);
  glow(raster, {
    x: center,
    y: heart - 16,
    radius: 110,
    colors: [art.sky[6], art.sky[7], art.gold[3], art.gold[4]],
    squash: 0.7,
  });
  paintAngkorWat(raster, { x: center, base: horizon - 1, colors: art.temple, light: 1 });
  paintNaga(raster, { x: center, y: heart, art, bottom: horizon + 4 });
  paintReflection(raster, { line: horizon, colors: art.water, seed: 2 });
  paintHumps(raster, { x: center, waterline: horizon, art });
  paintCauseway(raster, layout);
  paintBoy(raster, layout);
}
