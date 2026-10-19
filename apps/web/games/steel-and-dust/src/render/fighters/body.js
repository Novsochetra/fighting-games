import { BODY_ART } from '../../art/weapon-art.js';
import { weaponLine } from '../../sim/pose/weapon-line.js';
import { point } from '../painter.js';
import { drawCape } from './cape.js';
import { drawHead } from './head.js';
import { drawWeapon } from './weapon.js';

function boot(painter, { foot, facing, scale, color, outline }) {
  const width = Math.round(4 * scale);
  const x = facing > 0 ? foot.x - 1 : foot.x - width + 2;
  painter.use(outline).rect(x - 1, foot.y - 3, width + 2, 4);
  painter.use(color).rect(x, foot.y - 2, width, 2);
}

function fist(painter, { hand, scale, color, outline }) {
  const size = Math.round(3 * scale);
  painter.use(outline).rect(hand.x - size / 2 - 1, hand.y - size / 2 - 1, size + 2, size + 2);
  painter.use(color).rect(hand.x - size / 2, hand.y - size / 2, size, size);
}

// the torso's axis and its forward side, so cloth hangs right even when lying down
function torsoFrame(joints, facing) {
  const dx = joints.neck.x - joints.hip.x;
  const dy = joints.neck.y - joints.hip.y;
  const length = Math.hypot(dx, dy) || 1;
  const upX = dx / length;
  const upY = dy / length;
  let forwardX = -upY;
  let forwardY = upX;
  if (forwardX * facing - forwardY * 0.5 < -forwardX * facing + forwardY * 0.5) {
    forwardX = -forwardX;
    forwardY = -forwardY;
  }
  return { dx, dy, upX, upY, forwardX, forwardY };
}

function alongTorso(joints, frame, scale) {
  return (down, forward) =>
    point(
      joints.hip.x - frame.upX * down * scale + frame.forwardX * forward * scale,
      joints.hip.y - frame.upY * down * scale + frame.forwardY * forward * scale,
    );
}

function drawBackLimbs(painter, { joints, palette, scale, facing, thickness }) {
  const outline = palette.outline;
  painter.use(palette.jacketShade).limb(joints.shoulder, joints.backElbow, thickness, outline);
  painter
    .use(palette.bracerShade || palette.jacketShade)
    .limb(joints.backElbow, joints.backHand, thickness, outline);
  fist(painter, { hand: joints.backHand, scale, color: palette.glove, outline });
  painter.use(palette.pantsShade).limb(joints.hip, joints.backKnee, thickness + 1, outline);
  painter.use(palette.bootShade).limb(joints.backKnee, joints.backFoot, thickness, outline);
  boot(painter, { foot: joints.backFoot, facing, scale, color: palette.bootShade, outline });
  painter.use(palette.pants).limb(joints.hip, joints.frontKnee, thickness + 1, outline);
  painter.use(palette.boot).limb(joints.frontKnee, joints.frontFoot, thickness, outline);
  boot(painter, { foot: joints.frontFoot, facing, scale, color: palette.boot, outline });
}

function drawPlate(painter, { joints, palette, scale, frame }) {
  const chest = Math.max(7, Math.round(7 * scale));
  const top = point(joints.hip.x + frame.dx * 0.85, joints.hip.y + frame.dy * 0.85);
  const bottom = point(joints.hip.x + frame.dx * 0.3, joints.hip.y + frame.dy * 0.3);
  painter.use(palette.plate).line(bottom, top, chest - 2);
  painter.use(BODY_ART.plateShine).line(bottom, top, 1);
}

// a glowing tabard down the front, then the belt and buckle
function drawTorsoDetails(painter, parts) {
  const { joints, palette, scale, frame, along } = parts;
  if (palette.plate) {
    drawPlate(painter, parts);
  }
  if (palette.glow && !palette.hideTabard) {
    const neck = point(
      joints.neck.x + frame.forwardX * 1.5 * scale,
      joints.neck.y + frame.forwardY * 1.5 * scale,
    );
    const waist = point(
      joints.hip.x + frame.forwardX * 1.5 * scale,
      joints.hip.y + frame.forwardY * 1.5 * scale,
    );
    painter.use(palette.glow).line(neck, waist, Math.round(2 * scale));
    painter.use(palette.glowShade).line(waist, along(8, 1.5), Math.round(2 * scale));
  }
  if (palette.belt) {
    const width = Math.round(9 * scale);
    const left = point(
      joints.hip.x - (frame.forwardX * width) / 2,
      joints.hip.y - (frame.forwardY * width) / 2,
    );
    const right = point(
      joints.hip.x + (frame.forwardX * width) / 2,
      joints.hip.y + (frame.forwardY * width) / 2,
    );
    painter.use(palette.belt).line(left, right, 2);
    painter
      .use(palette.buckle)
      .rect(
        joints.hip.x + frame.forwardX * 2 * scale - 1,
        joints.hip.y + frame.forwardY * 2 * scale - 1,
        2,
        2,
      );
  }
}

function drawPauldron(painter, { joints, palette, scale }) {
  const width = Math.round(6 * scale);
  const height = Math.round(4 * scale);
  const x = Math.round(joints.shoulder.x - width / 2);
  const y = Math.round(joints.shoulder.y - height / 2 - 1);
  painter.use(palette.outline).rect(x - 1, y - 1, width + 2, height + 2);
  painter.use(palette.pauldron).rect(x, y, width, height);
  painter.use(palette.glow || BODY_ART.pauldronGlow).rect(x, y, width, 1);
  painter.use(palette.outline).rect(x, y + height - 1, width, 1);
}

function drawFrontArm(painter, { joints, palette, scale, thickness }) {
  const outline = palette.outline;
  painter.use(palette.jacket).limb(joints.shoulder, joints.frontElbow, thickness, outline);
  painter
    .use(palette.bracer || palette.skin)
    .limb(joints.frontElbow, joints.frontHand, thickness, outline);
  fist(painter, { hand: joints.frontHand, scale, color: palette.glove, outline });
}

// a skeleton fighter, back to front: cape, coat tail, far limbs, legs, torso, head, weapon, near arm
export function drawBody(painter, { fighter, joints, pose, palette, ghost, headStyle }) {
  const { scale, facing } = fighter;
  const thickness = Math.max(3, Math.round(3 * scale));
  const frame = torsoFrame(joints, facing);
  const along = alongTorso(joints, frame, scale);
  const parts = { joints, palette, scale, facing, thickness, frame, along };
  if (fighter.scarf && !ghost) {
    drawCape(painter, fighter.scarf, palette);
  }
  painter
    .use(palette.jacketShade)
    .limb(joints.hip, along(8, -4), Math.round(4 * scale), palette.outline);
  drawBackLimbs(painter, parts);
  painter.use(palette.jacket).limb(joints.hip, along(7, 2), Math.round(3 * scale), palette.outline);
  painter
    .use(palette.jacket)
    .limb(joints.hip, joints.neck, Math.max(7, Math.round(7 * scale)), palette.outline);
  drawTorsoDetails(painter, parts);
  drawHead(painter, { joints, scale, facing, palette, style: headStyle });
  const line = weaponLine(fighter, joints, pose);
  if (line) {
    drawWeapon(painter, line, { fighter, ghost });
  }
  drawFrontArm(painter, parts);
  if (palette.pauldron) {
    drawPauldron(painter, parts);
  }
}
