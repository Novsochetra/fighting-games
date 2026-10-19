import { BODY_ART } from '../../art/weapon-art.js';

function oddSize(size) {
  const rounded = Math.round(size);
  return rounded % 2 === 0 ? rounded + 1 : rounded;
}

function headBox(joints, size) {
  return {
    x: Math.round(joints.head.x - size / 2),
    y: Math.round(joints.head.y - size / 2),
  };
}

function hoodFace(painter, { x, y, size, unit, facing, palette }) {
  const width = 4 * unit;
  const height = 5 * unit;
  const faceX = facing > 0 ? x + size - width : x;
  const faceY = y + 2 * unit;
  painter.use(palette.skin).rect(faceX, faceY, width, height);
  painter
    .use(palette.skinShade)
    .rect(facing > 0 ? faceX : faceX + width - unit, faceY, unit, height);
  painter.use(palette.hair).rect(faceX, faceY, width, unit);
  if (palette.mask) {
    painter.use(palette.mask).rect(faceX, faceY + 3 * unit, width, height - 3 * unit);
  }
  painter
    .use(palette.eye)
    .rect(facing > 0 ? faceX + width - 2 * unit : faceX + unit, faceY + 2 * unit, unit, unit);
  painter.use(palette.glow).rect(faceX - (facing > 0 ? unit : 0), faceY - unit, width + unit, unit);
  painter
    .use(palette.glow)
    .rect(facing > 0 ? faceX - unit : faceX + width, faceY - unit, unit, height + unit);
  painter.use(palette.glowShade).rect(x, y + size - unit, size, unit);
}

function hood(painter, { joints, scale, facing, palette, unit }) {
  const size = oddSize(9 * scale);
  const { x, y } = headBox(joints, size);
  const drapeX = facing > 0 ? x - 2 * unit : x + size;
  painter
    .use(palette.outline)
    .rect(drapeX - 1, y + 2 * unit - 1, 2 * unit + 2, size - 2 * unit + 2);
  painter.use(palette.hood).rect(drapeX, y + 2 * unit, 2 * unit, size - 2 * unit);
  painter.use(palette.outline).rect(x - 1, y - 1, size + 2, size + 2);
  painter.use(palette.hood).rect(x, y, size, size);
  painter
    .use(palette.outline)
    .rect(facing > 0 ? x - unit : x + size - unit, y - unit, 2 * unit, unit);
  if (palette.headStyle) {
    hoodFace(painter, { x, y, size, unit, facing, palette });
  }
}

function horn(painter, { base, side, unit, palette }) {
  const middle = { x: base.x + side * 3 * unit, y: base.y - 2 * unit };
  const tip = { x: base.x + side * 2 * unit, y: base.y - 5 * unit };
  painter.use(palette.horn).limb(base, middle, 2 * unit, palette.outline);
  painter.use(palette.horn).limb(middle, tip, unit, palette.outline);
}

function bullFace(painter, { x, y, size, unit, facing, palette }) {
  const snoutWidth = 6 * unit;
  const snoutX = facing > 0 ? x + size - snoutWidth + unit : x - unit;
  painter
    .use(palette.outline)
    .rect(snoutX - 1, y + size - 5 * unit - 1, snoutWidth + 2, 5 * unit + 2);
  painter.use(palette.snout).rect(snoutX, y + size - 5 * unit, snoutWidth, 5 * unit);
  painter
    .use(BODY_ART.bullNostril)
    .rect(
      facing > 0 ? snoutX + snoutWidth - 2 * unit : snoutX + unit,
      y + size - 3 * unit,
      unit,
      unit,
    );
  painter
    .use(palette.buckle)
    .rect(
      facing > 0 ? snoutX + snoutWidth - 3 * unit : snoutX + 2 * unit,
      y + size - unit,
      unit,
      unit,
    );
  painter
    .use(palette.eye)
    .rect(facing > 0 ? x + size - 6 * unit : x + 4 * unit, y + 3 * unit, 2 * unit, unit);
}

function bull(painter, { joints, scale, facing, palette, unit }) {
  const size = oddSize(10 * scale);
  const { x, y } = headBox(joints, size);
  horn(painter, { base: { x: x + unit, y: y + unit }, side: -1, unit, palette });
  horn(painter, { base: { x: x + size - unit, y: y + unit }, side: 1, unit, palette });
  painter.use(palette.outline).rect(x - 1, y - 1, size + 2, size + 2);
  painter.use(palette.fur).rect(x, y, size, size);
  painter.use(palette.furShade).rect(x, y, size, unit);
  if (palette.headStyle) {
    bullFace(painter, { x, y, size, unit, facing, palette });
  }
}

// a turban with a tail and a cloth mask
function wrapped(painter, { joints, scale, facing, palette, unit }) {
  const size = oddSize(8 * scale);
  const { x, y } = headBox(joints, size);
  painter.use(palette.outline).rect(x - 1, y - 1, size + 2, size + 2);
  painter.use(palette.skin).rect(x, y, size, size);
  if (!palette.headStyle) {
    return;
  }
  painter.use(palette.hair).rect(x, y, size, 3 * unit);
  painter.use(palette.outline).rect(facing > 0 ? x - 2 : x + size, y, 2, 4 * unit);
  painter.use(palette.hair).rect(facing > 0 ? x - 1 : x + size, y + unit, 1, 2 * unit);
  painter.use(palette.mask).rect(x, y + 5 * unit, size, size - 5 * unit);
  painter
    .use(palette.eye)
    .rect(facing > 0 ? x + size - 2 * unit : x + unit, y + 4 * unit, unit, unit);
}

const HEADS = { hood, bull };

export function drawHead(painter, { joints, scale, facing, palette, style }) {
  const unit = Math.max(1, Math.round(scale));
  const draw = HEADS[style] || wrapped;
  draw(painter, { joints, scale, facing, palette, unit });
}
