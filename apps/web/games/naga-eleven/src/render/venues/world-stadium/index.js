import { WORLD_STADIUM } from '../../../art/venues/world-stadium.js';
import { packAll } from '../kit/colour.js';
import { pitchside } from '../shared/pitchside.js';
import { bandOf } from '../shared/band.js';
import { drawFireworks } from '../shared/fireworks.js';
import { drawFlashes } from '../shared/flashes.js';
import { paintFlags } from '../shared/flags.js';
import { floodlit } from '../shared/lighting.js';
import { paintNightSky } from '../shared/night.js';
import { ledBoards, nearBoards, stadiumGoal, stadiumGround } from '../shared/stadium.js';
import { paintBowl } from '../stands/bowl.js';

const art = packAll(WORLD_STADIUM);
const AISLES = { every: 96, width: 6, offset: 24 };
const BOWL = {
  wall: 10,
  ring: 7,
  tiers: [
    { rows: 7, rowPitch: 9, size: 6, fill: 0.97, aisles: AISLES },
    { rows: 7, rowPitch: 6, size: 4, fill: 0.96, aisles: AISLES },
    { rows: 8, rowPitch: 4, size: 3, fill: 0.95, aisles: AISLES },
  ],
  shade: 0.5,
  shadeRows: 36,
  lamps: 110,
  night: 0.45,
};

function paintStands(raster, frame) {
  paintBowl(raster, { art, frame, plan: BOWL });
  paintFlags(raster, {
    frame,
    every: 70,
    flags: art.flags,
    rows: { top: raster.height - 70, bottom: raster.height - 18 },
  });
}

function overlay(context, { layers, view, mood }) {
  const stands = layers.far[0];

  drawFlashes(context, {
    band: bandOf(stands, view, { top: 16, bottom: 10 }),
    mood,
    colour: WORLD_STADIUM.flash,
    many: 9,
  });
  drawFireworks(context, {
    band: bandOf(stands, view, { bottom: stands.frame.height - 70 }),
    mood,
    colours: WORLD_STADIUM.fireworks,
  });
}

function build(layout) {
  const stripes = { width: layout.pitch.length / 20, base: 3.2, checks: true };

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
        paint: (raster, _, frame) => paintStands(raster, frame),
      },
      ledBoards(art, { panel: 176 }),
    ],
    goal: stadiumGoal(layout, art, WORLD_STADIUM.net),
    ...pitchside(layout, { cloth: art.flagCloth }),
    near: [nearBoards(layout, art)],
    overlay,
  };
}

export const worldStadium = { id: 'world-stadium', sky: WORLD_STADIUM.sky[0], build };
