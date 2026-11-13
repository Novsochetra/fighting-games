import { rowFor } from '../../../../../src/render/actors/directions.js';
import { looksOf } from '../../../../../src/render/actors/looks.js';
import { sheetOf } from '../../../../../src/render/actors/sheets.js';
import { keeperRim, strikerRim } from './actors/light.js';
import { rimmedFrame } from './actors/rim.js';
import { stamp } from './bake.js';

// dressed by the game's own kits, so the lab shows the hero exactly as a match draws him; the
// keeper is Japan's, as his orange stands out against the night, the white goal and the emerald
const CAST = {
  teams: [
    { id: 'cambodia', kit: 'cambodia' },
    { id: 'japan', kit: 'japan' },
  ],
  players: [
    { index: 0, team: 0, slotIndex: 4, role: 'forward', star: 'sochetra' },
    { index: 1, team: 1, slotIndex: 0, role: 'keeper' },
  ],
};

const LOOKS = looksOf(CAST).players;

export const STRIKER_LOOK = LOOKS[0];

export const KEEPER_LOOK = LOOKS[1];

function frameOf(actors, { look, pose }) {
  const animation = actors?.manifest.animations[pose.animation];
  const sheet = animation && sheetOf(actors, look, pose.animation);

  if (!sheet) {
    return null;
  }

  const { width, height } = animation.frame ?? actors.manifest.frame;
  const anchor = animation.anchor ?? actors.manifest.anchor;
  const { row, mirror } = rowFor(animation.rows, pose.direction);
  const index = pose.frame % animation.frames;

  return {
    sheet,
    mirror,
    source: { x: index * width, y: row * height, width, height },
    left: Math.round(pose.x) - (mirror ? width - anchor.x : anchor.x),
    top: Math.round(pose.y) - anchor.y,
    key: `${look.key}:${pose.animation}:${index}:${row}:${mirror}`,
  };
}

function drawFrame(pen, { sheet, mirror, source, left, top }) {
  const { context, unit, origin } = pen;
  const x = origin.x + left * unit;

  context.save();
  context.imageSmoothingEnabled = false;
  context.translate(mirror ? x + source.width * unit : x, origin.y + top * unit);
  context.scale(mirror ? -unit : unit, unit);
  context.drawImage(
    sheet,
    source.x,
    source.y,
    source.width,
    source.height,
    0,
    0,
    source.width,
    source.height,
  );
  context.restore();
}

export function drawSprite(pen, actors, { look, pose, rim = null }) {
  const frame = frameOf(actors, { look, pose });

  if (!frame) {
    return;
  }

  const lit = rim?.level ? rimmedFrame(frame, { ...rim, key: frame.key }) : null;

  if (lit) {
    stamp(pen, lit, { left: frame.left, top: frame.top });

    return;
  }

  drawFrame(pen, frame);
}

export const drawStriker = (pen, moment) =>
  drawSprite(pen, moment.actors, {
    look: STRIKER_LOOK,
    pose: moment.player,
    rim: strikerRim(moment),
  });

export const drawKeeper = (pen, moment) =>
  drawSprite(pen, moment.actors, {
    look: KEEPER_LOOK,
    pose: moment.keeper,
    rim: keeperRim(moment),
  });
