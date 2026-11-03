import { ASIA_STADIUM } from '../../../art/venues/asia-stadium.js';
import { packAll } from '../kit/colour.js';
import { pitchside } from '../shared/pitchside.js';
import { bandOf } from '../shared/band.js';
import { drawFlashes } from '../shared/flashes.js';
import { floodlit } from '../shared/lighting.js';
import { paintNightSky } from '../shared/night.js';
import { ledBoards, nearBoards, stadiumGoal, stadiumGround } from '../shared/stadium.js';
import { paintBowl } from '../stands/bowl.js';

const art = packAll(ASIA_STADIUM);
const AISLES = { every: 104, width: 6, offset: 30 };
const BOWL = {
  wall: 10,
  ring: 8,
  tiers: [
    { rows: 8, rowPitch: 9, size: 6, fill: 0.93, aisles: AISLES },
    { rows: 7, rowPitch: 6, size: 4, fill: 0.9, aisles: AISLES },
  ],
  shade: 0.55,
  shadeRows: 44,
  lamps: 150,
  night: 0.5,
};

function build(layout) {
  const stripes = { width: layout.pitch.length / 24, base: 3.2 };

  return {
    ground: stadiumGround(layout, { art, stripes, light: floodlit(layout), surround: -1.4 }),
    back: [
      { depth: -9000, base: -64, height: 'toTop', paint: (raster) => paintNightSky(raster, art) },
    ],
    far: [
      {
        depth: -64,
        height: 'toTop',
        frames: 4,
        paint: (raster, _, frame) => paintBowl(raster, { art, frame, plan: BOWL }),
      },
      ledBoards(art),
    ],
    goal: stadiumGoal(layout, art, ASIA_STADIUM.net),
    ...pitchside(layout, { cloth: art.flagCloth }),
    near: [nearBoards(layout, art)],
    overlay: (context, scene) =>
      drawFlashes(context, {
        band: bandOf(scene.layers.far[0], scene.view, { top: 20, bottom: 10 }),
        mood: scene.mood,
        colour: ASIA_STADIUM.lamp,
        many: 3,
      }),
  };
}

export const asiaStadium = { id: 'asia-stadium', sky: ASIA_STADIUM.sky[0], build };
