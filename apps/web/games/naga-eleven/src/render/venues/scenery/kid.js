import { rect } from '../kit/raster.js';

// a village kid at 1x, about half a footballer tall, feet at `y`: a mop of black hair over a round
// face, a bright shirt with short sleeves, shorts and bare legs. `pose` is 'stand', 'sit' (on a
// rail, legs hanging), 'swing' (legs kicked out), 'cheer' (arms up) or 'jump'
const HEAD = { width: 8, hair: 3, face: 5 };
const SHIRT = { width: 10, height: 9 };

function paintHead(raster, { x, top }, look) {
  const left = x + 1;

  rect(raster, { x: left, y: top, width: HEAD.width, height: HEAD.hair + 1 }, look.hair);
  rect(raster, { x: left + 1, y: top - 1, width: HEAD.width - 2, height: 1 }, look.hair);
  rect(raster, { x: left, y: top + HEAD.hair, width: HEAD.width, height: HEAD.face }, look.skin);
  rect(raster, { x: left, y: top + HEAD.hair, width: 1, height: HEAD.face }, look.skinLight);
  rect(raster, { x: left + 1, y: top + HEAD.hair, width: HEAD.width - 3, height: 1 }, look.hair);
  rect(raster, { x: left + 2, y: top + HEAD.hair + 2, width: 1, height: 1 }, look.hair);
  rect(raster, { x: left + 5, y: top + HEAD.hair + 2, width: 1, height: 1 }, look.hair);
  rect(raster, { x: left + 1, y: top + 1, width: 2, height: 1 }, look.hairLight);
}

function paintShirt(raster, { x, top, up }, look) {
  const arm = up ? { y: top - 7, height: 9 } : { y: top + 2, height: 7 };

  rect(raster, { x: x - 1, y: arm.y, width: 2, height: arm.height }, look.skin);
  rect(raster, { x: x + SHIRT.width - 1, y: arm.y, width: 2, height: arm.height }, look.skin);
  rect(raster, { x, y: top, width: SHIRT.width, height: SHIRT.height }, look.shirt[1]);
  rect(raster, { x, y: top, width: 2, height: SHIRT.height }, look.shirt[2]);
  rect(
    raster,
    { x: x + SHIRT.width - 2, y: top + 1, width: 2, height: SHIRT.height - 1 },
    look.shirt[0],
  );
  rect(raster, { x: x + 3, y: top, width: 4, height: 1 }, look.shirt[0]);
}

function paintLegs(raster, { x, y, pose }, look) {
  if (pose === 'sit' || pose === 'swing') {
    const kick = pose === 'swing' ? 2 : 0;

    rect(raster, { x: x + 1, y: y - 8, width: 8, height: 3 }, look.shorts);
    rect(raster, { x: x + 2 - kick, y: y - 5, width: 2, height: 6 }, look.skin);
    rect(raster, { x: x + 6 + kick, y: y - 5, width: 2, height: 6 }, look.skin);

    return;
  }

  rect(raster, { x: x + 1, y: y - 11, width: 8, height: 4 }, look.shorts);
  rect(raster, { x: x + 2, y: y - 7, width: 2, height: 7 }, look.skin);
  rect(raster, { x: x + 6, y: y - 7, width: 2, height: 7 }, look.skin);
  rect(raster, { x: x + 1, y: y - 1, width: 3, height: 1 }, look.hair);
  rect(raster, { x: x + 6, y: y - 1, width: 3, height: 1 }, look.hair);
}

export function paintKid(raster, { x, y, pose }, look) {
  const lift = pose === 'jump' ? 4 : 0;
  const seated = pose === 'sit' || pose === 'swing';
  const feet = y - lift;
  const shirtTop = feet - (seated ? 8 : 11) - SHIRT.height;

  paintLegs(raster, { x, y: feet, pose }, look);
  paintShirt(raster, { x, top: shirtTop, up: pose === 'cheer' || pose === 'jump' }, look);
  paintHead(raster, { x, top: shirtTop - HEAD.hair - HEAD.face }, look);
}

export const KID_WIDTH = SHIRT.width;
