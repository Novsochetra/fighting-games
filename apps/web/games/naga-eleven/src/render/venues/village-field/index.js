import { VILLAGE_FIELD } from '../../../art/venues/village-field.js';
import { NEAR_RUN } from '../../camera/bounds.js';
import { markingsOf } from '../ground/markings.js';
import { packAll, packedAlpha } from '../kit/colour.js';
import { pitchside } from '../shared/pitchside.js';
import { bambooGoal } from '../shared/goal-style.js';
import { paintClouds, paintSky } from '../shared/sky.js';
import { paintFence } from './fence.js';
import { limeLines, villageSurface } from './ground.js';
import { distantTrees, villageRow } from './skyline.js';
import { drawDog } from './dog.js';
import { puddleOf } from './puddle.js';
import { drawRipple } from './ripple.js';
import { DOG_SIZE, paintDog } from '../scenery/dog.js';

const art = packAll(VILLAGE_FIELD);
const LINES = { along: 2.6, across: 2, spot: 5 };

const backLayers = (layout) => [
  {
    depth: -9000,
    base: -196,
    height: 'toTop',
    paint: (raster) => {
      paintSky(raster, { ramp: art.sky });
      paintClouds(raster, {
        ramp: art.cloud,
        row: Math.round(raster.height * 0.35),
        every: 300,
        salt: 4,
      });
    },
  },
  distantTrees(layout, art),
];

function build(layout) {
  const { pitch } = layout;
  const side = pitchside(layout, { cloth: art.flagCloth, pole: art.bamboo.slice(1), press: false });
  const puddle = puddleOf(layout);

  return {
    ground: {
      far: -198,
      near: pitch.width + NEAR_RUN + 10,
      surface: villageSurface(layout, art),
      lines: { markings: markingsOf(layout), thick: LINES, colour: limeLines(art) },
    },
    back: backLayers(layout),
    far: [
      villageRow(layout, art),
      {
        depth: -20,
        height: 56,
        frames: 4,
        paint: (raster, frame, index) => paintFence(raster, { frame, index, layout, art }),
      },
    ],
    goal: bambooGoal(layout, {
      post: art.bamboo,
      net: packedAlpha(VILLAGE_FIELD.net, 0.55),
      netNear: packedAlpha(VILLAGE_FIELD.net, 0.4),
      veil: packedAlpha(VILLAGE_FIELD.net, 0.08),
      stay: art.rope,
    }),
    near: [],
    sprites: {
      ...side.sprites,
      dog: { ...DOG_SIZE, frames: 3, paint: (raster, index) => paintDog(raster, index, art.dog) },
    },
    props: side.props,
    overlay: (context, scene) => {
      drawRipple(context, scene, puddle);
      drawDog(context, scene);
    },
  };
}

export const villageField = { id: 'village-field', sky: VILLAGE_FIELD.sky[0], build };
