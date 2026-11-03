import { animationName } from '../../actors/animation.js';
import { rowFor } from '../../actors/directions.js';
import { drawActor } from '../../actors/draw-actor.js';
import { sheetOf } from '../../actors/sheets.js';
import { frameIn, sheetShotOf } from './sheet-poses.js';
import { frameRuns } from './sprite-mask.js';

// where a shot's frame lies: its animation, frame, row and mirroring, and its box on the art grid
// with its anchor (between the soles) at `at`
export function placementOf(art, shot, at) {
  const { animations } = art.manifest;
  const name = animationName(animations, { name: shot.animation });
  const animation = animations[name];
  const frame = frameIn(shot, animation.frames);
  const { row, mirror } = rowFor(animation.rows, shot.direction);
  const { width, height } = animation.frame ?? art.manifest.frame;
  const anchor = animation.anchor ?? art.manifest.anchor;

  return {
    name,
    state: { name, age: (frame * 60) / animation.fps + 0.5, direction: shot.direction },
    source: { x: frame * width, y: row * height, width, height },
    mirror,
    left: at.x - (mirror ? width - anchor.x : anchor.x),
    top: at.y - anchor.y,
  };
}

function paintRuns(pen, { runs, place, color, dx = 0, dy = 0 }) {
  const { width } = place.source;

  for (const [x, y, length] of runs) {
    const left = place.mirror ? width - x - length : x;

    pen.rect([place.left + left + dx, place.top + y + dy, length, 1], color);
  }
}

// one pixel of the sheet to one of the clash's, so he has the finish he has on the pitch
function drawFrame(pen, art, { look, number, place, at }) {
  const { context } = pen;

  context.save();
  context.translate(pen.origin.x + at.x * pen.unit, pen.origin.y + at.y * pen.unit);
  context.scale(pen.unit, pen.unit);
  context.imageSmoothingEnabled = false;
  drawActor(context, art, { look, state: place.state, x: 0, y: 0, number });
  context.restore();
}

// a player from his sheets, lit along his back and the top of him by the move's light (`rim`);
// `body` paints the whole of him in one colour, for an afterimage
export function drawSpriteFigure(pen, { art, look, number, clock, rim, body, ...figure }) {
  const facing = figure.facing < 0 ? -1 : 1;
  const shot = sheetShotOf({ ...figure, facing }, clock);
  const at = { x: Math.round(figure.x + shot.dx), y: Math.round(figure.y) };
  const place = placementOf(art, shot, at);
  const sheet = sheetOf(art, look, place.name);
  const runs = sheet ? frameRuns(sheet, place.source) : null;

  if (runs && rim) {
    paintRuns(pen, { runs, place, color: rim, dx: -facing, dy: -1 });
  }

  if (runs && body) {
    paintRuns(pen, { runs, place, color: body });

    return;
  }

  drawFrame(pen, art, { look, number, place, at });
}
