import { drawBall } from './ball.js';
import { attackerOf, defenderOf } from './clash-actors.js';
import { drawClashGround } from './clash-ground.js';
import { drawFigure } from './figure.js';
import { drawGoalFrame } from './goal-frame.js';
import { drawImpact } from './impact.js';
import { lookOf } from './looks/index.js';
import { clashScene } from './scene.js';

function goal(pen, scene) {
  if (!scene.keeper) {
    return;
  }

  const bulge =
    scene.word === 'goal' && scene.after > 0.9 ? Math.max(0, 6 - (scene.t - 80) / 4) : 0;

  drawGoalFrame(pen, { bulge, tick: scene.tick });
}

const looksOf = (scene) => ({
  attack: lookOf(scene.look),
  guard: scene.defend.move ? lookOf(scene.defend.look) : {},
});

function figures(pen, scene, looks, cast) {
  const attacker = looks.attack.attacker?.(scene) ?? attackerOf(scene);
  const guardRim = scene.guardArt ? scene.guardArt.body[4] : scene.art.body[4];

  looks.guard.behind?.(pen, scene);
  drawFigure(pen, { ...defenderOf(scene), rim: guardRim, ...cast, side: 'defend' });
  looks.attack.figures?.(pen, scene, attacker, cast);
  drawFigure(pen, { ...attacker, rim: scene.art.body[4], ...cast, side: 'attack' });
}

// back to front: the ground, the goal, the attack's move behind, the two figures, the guard's
// move, the attack's move in front and the ball, then the light where they meet
export function drawClash(pen, show, { tick, actors }) {
  const scene = clashScene(show, tick);
  const looks = looksOf(scene);

  scene.ball = looks.attack.ball?.(scene) ?? scene.ball;
  drawClashGround(pen, scene);
  goal(pen, scene);
  looks.attack.back?.(pen, scene);
  figures(pen, scene, looks, { show, actors });
  looks.guard.guard?.(pen, scene);
  looks.attack.front?.(pen, scene);
  drawBall(pen, { ...scene.ball, tick });
  drawImpact(pen, scene);
}
