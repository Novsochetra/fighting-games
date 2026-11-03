import { DUEL_UI } from '../../../art/duel/palette.js';
import { drawParts, shadedDisc } from '../parts.js';
import { GROUND, KEEPER } from '../paths.js';
import { ring } from '../shapes.js';
import { holds, riseOf } from './barrier.js';
import { drawStar } from './star.js';

const BELLY = { x: KEEPER.x - 6, y: GROUND - 24, radius: 15 };

// squashed flat as the ball sinks in, then wobbling back out round
export function squashOf(since) {
  if (since < 0) {
    return 1;
  }

  return 1 - Math.sin(since * 0.9) * Math.max(0, 1 - since / 24) * 0.3;
}

// a belly blown up round as a rubber ball, lit from the top left, its button in the middle
export function drawRoundBelly(pen, { x, y, radius, squash, art }) {
  const wide = radius / squash;
  const tall = radius * squash;

  drawParts(pen, [
    { kind: 'ellipse', x, y, radiusX: wide, radiusY: tall, color: art.body[2] },
    {
      kind: 'ellipse',
      x: x - 3,
      y: y - 3,
      radiusX: wide * 0.7,
      radiusY: tall * 0.6,
      color: art.body[3],
      ink: false,
    },
    {
      kind: 'disc',
      x: x - wide * 0.45,
      y: y - tall * 0.45,
      radius: radius * 0.2,
      color: art.body[4],
      ink: false,
    },
    { kind: 'disc', x, y: y + tall * 0.2, radius: 1, color: art.body[0], ink: false },
  ]);
}

// the boing: rings thrown off the belly, and stars spinning round the keeper's head after
export function drawBoing(pen, { at, head, radius, since, art }) {
  if (since < 14) {
    ring(pen, { ...at, radius: radius + since * 2, width: 2, color: art.accent[2] });
    ring(pen, { ...at, radius: radius + since * 2 - 3, width: 1, color: DUEL_UI.white });
  }

  for (let i = 0; i < 3; i += 1) {
    const angle = since * 0.25 + (i / 3) * Math.PI * 2;

    drawStar(pen, {
      x: head.x + Math.cos(angle) * 13,
      y: head.y + Math.sin(angle) * 4,
      size: 3,
      art,
    });
  }
}

// Belly Block: Dara puffs his belly out round as a ball and the shot bounces off it; stars
// spin round his head after, as in a cartoon
function guard(pen, scene) {
  const art = scene.guardArt;
  const held = holds(scene);
  const radius = BELLY.radius * (held ? riseOf(scene) : Math.max(0.2, 1 - scene.sinceHit / 10));

  if (radius < 2) {
    return;
  }

  drawRoundBelly(pen, {
    x: BELLY.x,
    y: BELLY.y,
    radius,
    squash: squashOf(scene.hit ? scene.sinceHit : -1),
    art,
  });

  if (scene.hit && held && scene.sinceHit < 40) {
    drawBoing(pen, {
      at: { x: BELLY.x - 10, y: BELLY.y },
      head: { x: KEEPER.x, y: GROUND - 62 },
      radius: 4,
      since: scene.sinceHit,
      art,
    });
  }
}

// a round belly bouncing through the band, comic stars about it
function bandFigure(pen, cut) {
  const x = cut.offset + (cut.side === 'defend' ? 96 : 176);
  const bounce = Math.abs(Math.sin(cut.tick / 7)) * 10;

  shadedDisc(pen, {
    x,
    y: cut.top + cut.height - 26 - bounce,
    radius: 22,
    ramp: cut.relief.body.slice(1),
  });

  for (let i = 0; i < 4; i += 1) {
    drawStar(pen, { x: x - 40 + i * 26, y: cut.top + 14 + (i % 2) * 8, size: 4, art: cut.relief });
  }
}

export const BELLY_LOOK = { guard, band: bandFigure };
