import { HOME_NIGHT_ART } from '../../../art/backdrops/home.js';
import { hash } from '../hash.js';
import { paintLit } from '../parts/light.js';
import { drawFlame, paintOilLamp } from '../parts/oil-lamp.js';
import { planks, weave } from '../parts/textures.js';
import { artRect } from '../pen.js';
import { fillRect, hline } from '../raster.js';
import { WINDOW, paintKrama, paintMat, paintNightWindow, paintPhoto } from './home-props.js';

// inside the house on its posts, at night, in the rain: one lamp on the low table
const art = HOME_NIGHT_ART;
const wood = art.warm;
const LAMP = { x: 178, y: 136 };
const lightOf = (frame) => ({ x: LAMP.x, y: LAMP.y - 14, radius: 250 - frame * 8, squash: 1.2 });

function paintRoom(raster, light) {
  paintLit(raster, {
    rect: { x: 0, y: 0, width: 384, height: 152 },
    ramp: wood,
    light,
    texture: weave,
  });
  paintLit(raster, {
    rect: { x: 0, y: 152, width: 384, height: 64 },
    ramp: wood,
    light,
    texture: planks(5),
  });
  [
    [18, 12],
    [354, 12],
  ].forEach(([x, width]) => {
    paintLit(raster, {
      rect: { x, y: 0, width, height: 156 },
      ramp: wood.slice(0, 6),
      light,
      texture: (px) => (px === x ? -1 : 0),
    });
  });
  paintLit(raster, {
    rect: { x: 0, y: 8, width: 384, height: 9 },
    ramp: wood.slice(0, 6),
    light,
    texture: (_, y) => (y === 16 ? -1.5 : 0),
  });
  paintLit(raster, {
    rect: { x: 0, y: 146, width: 384, height: 7 },
    ramp: wood.slice(0, 6),
    light,
    texture: (_, y) => (y === 146 ? 1 : 0),
  });
}

function paintTable(raster) {
  fillRect(raster, { x: 146, y: 136, width: 64, height: 4 }, wood[5]);
  hline(raster, { x: 146, y: 136, length: 64 }, wood[7]);
  hline(raster, { x: 146, y: 139, length: 64 }, wood[3]);
  [150, 204].forEach((legX) =>
    fillRect(raster, { x: legX, y: 140, width: 3, height: 18 }, wood[3]),
  );
  fillRect(raster, { x: 192, y: 130, width: 10, height: 6 }, wood[4]);
  hline(raster, { x: 192, y: 130, length: 10 }, wood[6]);
}

function paintHome(raster, frame) {
  const light = lightOf(frame);

  paintRoom(raster, light);
  paintNightWindow(raster, { art, wood });
  paintPhoto(raster, { x: 112, y: 48, art, wood });
  paintKrama(raster, { x: 62, y: 38, art });
  paintMat(raster, { art, wood, light });
  paintTable(raster);
  paintOilLamp(raster, {
    x: LAMP.x,
    y: LAMP.y,
    colors: { brass: [wood[4], wood[6], wood[7]], glass: art.glass },
  });
}

function drawRain(context, tick) {
  for (let i = 0; i < 26; i += 1) {
    const x = WINDOW.x + Math.floor(hash(i, 1) * WINDOW.width);
    const fall = (hash(i, 2) * WINDOW.height + tick * (2 + hash(i, 3))) % WINDOW.height;

    artRect(
      context,
      {
        x: x - Math.floor(fall / 8),
        y: WINDOW.y + fall,
        width: 1,
        height: Math.min(3, WINDOW.height - fall),
      },
      art.rain,
    );
  }
}

export const HOME_NIGHT = {
  frameOf: (tick) => (hash(Math.floor(tick / 6)) > 0.55 ? 1 : 0),
  paint: paintHome,
  overlay: (context, tick) => {
    drawRain(context, tick);
    drawFlame(context, { x: LAMP.x, y: LAMP.y, colors: art.flame, tick });
  },
};
