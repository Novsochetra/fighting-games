import { drawPropSprite } from '../scene/props/prop-sprites.js';

// reaches past anything on the road, so a cut along a doorway's sides holds all of the hero below it
const FAR = 2000;
const UNSEEN = new Set(['wait', 'gone']);

// a hero fading into a door's dark or out of it: everything it draws is drawn that much fainter, the
// shades it lays on its own way included
function drawFaded(painter, shown, draw) {
  if (shown >= 1) {
    draw();
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

export function drawInDoorway(painter, { game, fighter }, draw) {
  const run = game.gateRun;

  if (fighter !== game.player || !run?.inDoorway) {
    draw();
    return;
  }

  if (UNSEEN.has(run.phase) || run.alpha <= 0) {
    return;
  }

  // only what is in the door's hole and below it shows, where the door's rubble, drawn again over
  // the hero, hides the feet
  const { x, y, width } = run.doorway.opening;
  const { context } = painter;

  context.save();
  context.beginPath();
  context.rect(x, y, width, FAR);
  context.clip();
  drawFaded(painter, run.alpha, draw);
  context.restore();
}

// a hero in a door's hole is in the door, so the door is drawn again over it, all but its painted
// black hole, in front of which the hero fades
export function drawWallOverHero(painter, { game, sheets }) {
  const run = game.gateRun;

  if (!run?.inDoorway || !run.doorway.dark) {
    return;
  }

  const { wall, opening } = run.doorway;
  const { x, y, width, height } = opening;
  const { context } = painter;

  context.save();
  context.beginPath();
  context.rect(x - FAR, y - FAR, FAR * 2, FAR * 2);
  context.rect(x, y, width, height);
  context.clip('evenodd');
  drawPropSprite(painter, sheets, wall);
  context.restore();
}
