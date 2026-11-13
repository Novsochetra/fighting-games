import { rowFor } from '../../../../../src/render/actors/directions.js';
import { looksOf } from '../../../../../src/render/actors/looks.js';
import { sheetOf } from '../../../../../src/render/actors/sheets.js';

// Sochetra in Cambodia's red, blue and red, and Iran's Farhad in goal, dressed by the game's own
// kits as a match would dress them
const CAST = {
  teams: [
    { id: 'cambodia', kit: 'cambodia' },
    { id: 'iran', kit: 'iran' },
  ],
  players: [
    { index: 0, team: 0, slotIndex: 4, role: 'forward', star: 'sochetra' },
    { index: 1, team: 1, slotIndex: 0, role: 'keeper', star: 'farhad' },
  ],
};

const LOOKS = looksOf(CAST).players;

export const STRIKER_LOOK = LOOKS[0];

export const KEEPER_LOOK = LOOKS[1];

// a frame of the sprite laid on the pen, its anchor (between the feet) on the world point, each
// of its pixels one art pixel
export function drawSprite(pen, actors, { look, pose }) {
  const animation = actors?.manifest.animations[pose.animation];
  const sheet = animation && sheetOf(actors, look, pose.animation);

  if (!sheet) {
    return;
  }

  const { width, height } = animation.frame ?? actors.manifest.frame;
  const anchor = animation.anchor ?? actors.manifest.anchor;
  const { row, mirror } = rowFor(animation.rows, pose.direction);
  const left = Math.round(pose.x) - (mirror ? width - anchor.x : anchor.x);
  const top = Math.round(pose.y) - anchor.y;
  const { context, unit, origin } = pen;
  const x = origin.x + left * unit;

  context.save();
  context.imageSmoothingEnabled = false;
  context.translate(mirror ? x + width * unit : x, origin.y + top * unit);
  context.scale(mirror ? -unit : unit, unit);
  context.drawImage(
    sheet,
    (pose.frame % animation.frames) * width,
    row * height,
    width,
    height,
    0,
    0,
    width,
    height,
  );
  context.restore();
}

export const drawStriker = (pen, { actors, player }) =>
  drawSprite(pen, actors, { look: STRIKER_LOOK, pose: player });

export const drawKeeper = (pen, { actors, keeper }) =>
  drawSprite(pen, actors, { look: KEEPER_LOOK, pose: keeper });
