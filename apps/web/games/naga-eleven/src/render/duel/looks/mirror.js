import { DUEL_UI } from '../../../art/duel/palette.js';
import { drawAfterimage } from '../figure.js';
import { hash } from '../hash.js';
import { polygon } from '../shapes.js';
import { runnerAt } from './runner.js';

// the copies stand a little off the real one, one above and one below, as if in two mirrors
const COPIES = [
  { dx: 6, dy: -9 },
  { dx: -5, dy: 7 },
];

function shards(pen, { at, scene }) {
  for (let i = 0; i < 10; i += 1) {
    const angle = hash(i, 101) * Math.PI * 2;
    const reach = scene.sinceHit * (1 + hash(i, 102));
    const x = at.x + Math.cos(angle) * reach;
    const y = at.y - 20 + Math.sin(angle) * reach;

    polygon(
      pen,
      [
        [x, y - 3],
        [x + 2, y + 2],
        [x - 2, y + 1],
      ],
      i % 2 ? scene.art.body[4] : DUEL_UI.white,
    );
  }
}

// Mirror Step: the dribbler splits in three, and the defender goes for the wrong one
function figures(pen, scene, attacker, cast) {
  const real = runnerAt(scene);
  const broken = scene.hit && scene.sinceHit < 30;

  COPIES.forEach((copy, i) => {
    const at = { ...real, x: real.x + copy.dx, y: real.y + copy.dy };

    if (broken && i === 1) {
      shards(pen, { at, scene });

      return;
    }

    const shimmer = 0.45 + hash(i, Math.floor(scene.tick / 3)) * 0.2;

    drawAfterimage(pen, {
      ...at,
      body: scene.art.body[2],
      rim: scene.art.body[4],
      alpha: scene.hit ? shimmer * 0.5 : shimmer,
      ...cast,
      side: 'attack',
    });
  });
}

export const MIRROR = { attacker: runnerAt, figures };
