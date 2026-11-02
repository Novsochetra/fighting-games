import { drawPropSprite } from '../scene/props/prop-sprites.js';

// reaches past the edges of the biggest wall, so the clip around a door's inside holds all of it
const WALL_REACH = 200;

// a hero fading into a doorway or out of one: everything it draws is drawn that much fainter, the
// shades it lays on its own way included
export function drawFaded(painter, shown, draw) {
  if (shown >= 1) {
    draw();
    return;
  }

  if (shown <= 0) {
    return;
  }

  const { alpha } = painter;

  painter.alpha = (value) => alpha(value * shown);
  painter.alpha(1);

  try {
    draw();
  } finally {
    painter.alpha = alpha;
    alpha(1);
  }
}

export function heroShown(game, fighter) {
  return fighter === game.player ? (game.gateRun?.alpha ?? 1) : 1;
}

// a hero in a doorway stands behind its wall: the wall is drawn again over the hero, all but a
// door's painted dark inside, so the hero shows there and through the wall's see-through gaps
export function drawWallOverHero(painter, { game, sheets }) {
  const run = game.gateRun;

  if (!run?.behind) {
    return;
  }

  const { wall, inside } = run.doorway;
  const { context } = painter;

  context.save();

  if (inside) {
    context.beginPath();
    context.rect(inside.x - WALL_REACH, inside.y - WALL_REACH, WALL_REACH * 3, WALL_REACH * 3);
    context.rect(inside.x, inside.y, inside.width, inside.height);
    context.clip('evenodd');
  }

  drawPropSprite(painter, sheets, wall);
  context.restore();
}
