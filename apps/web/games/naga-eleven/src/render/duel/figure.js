import { castOf } from './clash/cast.js';
import { drawSilhouette, jointAt } from './clash/silhouette.js';
import { drawSpriteFigure } from './clash/sprite-figure.js';
import { POSES } from './poses.js';

// a player of the clash, from the footballer's sheets in his own kit, skin, hair and number when
// it is given the show, his side of it and the loaded sheets (`actors`); else the lit shadow the
// penalty show draws
export function drawFigure(pen, { show, side, actors, ...figure }) {
  const cast = actors?.images ? castOf(show, side) : null;

  if (!cast) {
    drawSilhouette(pen, figure);

    return;
  }

  drawSpriteFigure(pen, { ...figure, ...cast, art: actors, clock: show.ticks });
}

export function drawAfterimage(pen, { alpha, ...figure }) {
  pen.context.save();
  pen.context.globalAlpha *= alpha;
  drawFigure(pen, figure);
  pen.context.restore();
}

export const handOf = (pose, { x, y, facing = 1 }) =>
  jointAt({ x, y, facing }, POSES[pose].arms.front[1]);

export const footOf = (pose, { x, y, facing = 1 }) =>
  jointAt({ x, y, facing }, POSES[pose].legs.front[1]);
