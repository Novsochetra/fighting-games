import { PITCHSIDE } from '../../../art/venues/pitchside.js';
import { packAll } from '../kit/colour.js';
import { cornerFlags, photographers } from '../props/drawables.js';
import { FLAG_SIZE, paintCornerFlag } from '../scenery/corner-flag.js';
import { PHOTOGRAPHER_SIZE, paintPhotographer } from '../scenery/photographer.js';

const people = packAll(PITCHSIDE);

// the sprites and props a venue sets round its pitch: corner flags in its colour, and in a
// stadium the photographers at the ends; `pole` is the flagpole's ramp, if not white
export function pitchside(layout, { cloth, pole = people.pole, press = true }) {
  const sprites = {
    flag: {
      ...FLAG_SIZE,
      frames: 2,
      paint: (raster, index) => paintCornerFlag(raster, index, { pole, cloth }),
    },
  };

  if (press) {
    sprites.photographer = {
      ...PHOTOGRAPHER_SIZE,
      frames: 2,
      paint: (raster, index) => paintPhotographer(raster, index),
    };
  }

  return { sprites, props: [...cornerFlags(layout), ...(press ? photographers(layout) : [])] };
}
