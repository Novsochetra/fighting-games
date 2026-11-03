import { rect } from '../kit/raster.js';

// a fan in the stands at 1x, `size` pixels across the shoulders (3 for the far top of a huge bowl,
// up to 7 for the front rows by the pitch): a head with hair or a cap on top, lit from the top
// left, on a shirt lit down its left side and shaded down its right
function proportionsOf(size) {
  return {
    head: size >= 6 ? size - 2 : Math.max(1, size - 2),
    hair: size >= 6 ? 2 : 1,
    face: size >= 6 ? 3 : Math.max(1, size - 3),
    body: size >= 5 ? size + 2 : size + 1,
  };
}

export function fanHeight(size) {
  const { hair, face, body } = proportionsOf(size);

  return hair + face + body;
}

function drawHead(raster, { x, y, size, shape }, look) {
  const left = x + Math.floor((size - shape.head) / 2);

  rect(raster, { x: left, y, width: shape.head, height: shape.hair }, look.hair);
  rect(raster, { x: left, y: y + shape.hair, width: shape.head, height: shape.face }, look.skin);

  if (size >= 4) {
    rect(raster, { x: left, y, width: 1, height: 1 }, look.hairLight);
  }

  if (size >= 6) {
    rect(
      raster,
      { x: left, y: y + shape.hair, width: 1, height: shape.face },
      look.skinLight ?? look.skin,
    );
  }
}

function drawShirt(raster, { x, y, size, shape }, look) {
  const shoulder = size >= 6 ? 1 : 0;

  rect(raster, { x, y: y + shoulder, width: size, height: shape.body - shoulder }, look.shirt[1]);
  rect(raster, { x: x + shoulder, y, width: size - shoulder * 2, height: 1 }, look.shirt[1]);
  rect(raster, { x, y: y + shoulder, width: 1, height: shape.body - shoulder }, look.shirt[2]);
  rect(
    raster,
    { x: x + size - 1, y: y + shoulder, width: 1, height: shape.body - shoulder },
    look.shirt[0],
  );
}

// both arms up, or (`wave`) one up and one bent at the shoulder, in the colour of the skin
function drawArms(raster, { x, y, size, wave }, skin) {
  const reach = Math.max(2, Math.round(size * 0.8));

  rect(raster, { x: x - 1, y: wave ? y + 2 : y - reach + 2, width: 1, height: reach }, skin);
  rect(raster, { x: x + size, y: y - reach + 2, width: 1, height: reach }, skin);
}

// `y` is the top of the fan sitting still; `lift` raises them, `arms` puts their arms up
export function drawFan(raster, { x, y, size, lift = 0, arms = null }, look) {
  const shape = proportionsOf(size);
  const top = y - lift;

  if (arms) {
    drawArms(raster, { x, y: top, size, wave: arms === 'wave' }, look.skin);
  }

  drawHead(raster, { x, y: top, size, shape }, look);
  drawShirt(raster, { x, y: top + shape.hair + shape.face, size, shape }, look);
}
