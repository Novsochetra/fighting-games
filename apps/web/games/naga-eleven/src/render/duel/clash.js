import { drawBall } from './ball.js';
import { attackerOf, defenderOf, isTackled } from './clash-actors.js';
import { drawLandingDust } from './clash/dust.js';
import { tackleOf } from './clash/tackle.js';
import { drawClashGround } from './clash-ground.js';
import { drawFigure } from './figure.js';
import { drawGoalFrame } from './goal-frame.js';
import { drawImpact } from './impact.js';
import { clashView } from './lens/clash-view.js';
import { lensPen } from './lens/lens-pen.js';
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

const tackledBall = (scene) => (isTackled(scene) ? tackleOf(scene).ball?.(scene) : null);

function attackerFigure(scene, looks) {
  if (isTackled(scene)) {
    return attackerOf(scene);
  }

  return looks.attack.attacker?.(scene) ?? attackerOf(scene);
}

function figures(pen, scene, looks, cast) {
  const attacker = attackerFigure(scene, looks);
  const guardRim = scene.guardArt ? scene.guardArt.body[4] : scene.art.body[4];
  const tackled = isTackled(scene);

  looks.guard.behind?.(pen, scene);
  drawFigure(pen, { ...defenderOf(scene), rim: guardRim, ...cast, side: 'defend' });
  looks.attack.figures?.(pen, scene, attacker, cast);

  if (tackled) {
    const tackle = tackleOf(scene);

    drawLandingDust(pen, { x: tackle.landing(scene), since: scene.sinceHit - tackle.lands });
  }

  drawFigure(pen, { ...attacker, rim: scene.art.body[4], ...cast, side: 'attack' });
}

// the ball won behind a wall the guard's move raised lies behind it with him, not in front of it
function guardAndBall(pen, scene, looks) {
  const behind = scene.walled && isTackled(scene);

  if (behind) {
    drawBall(pen, { ...scene.ball, tick: scene.tick });
  }

  looks.guard.guard?.(pen, scene);
  looks.attack.front?.(pen, scene);

  if (!behind) {
    drawBall(pen, { ...scene.ball, tick: scene.tick });
  }
}

// back to front: the ground, the goal, the attack's move behind, the two figures, the guard's
// move, the attack's move in front and the ball, then the light where they meet
export function drawClash(base, show, { tick, actors }) {
  const scene = clashScene(show, tick);
  const looks = looksOf(scene);
  const pen = lensPen(base, clashView(show, scene));

  // a guard's move drawn in front of the defender is a wall between the two
  scene.walled = Boolean(looks.guard.guard);
  scene.ball = tackledBall(scene) ?? looks.attack.ball?.(scene) ?? scene.ball;
  drawClashGround(pen, scene);
  goal(pen, scene);
  looks.attack.back?.(pen, scene);
  figures(pen, scene, looks, { show, actors });
  guardAndBall(pen, scene, looks);
  drawImpact(pen, scene);
}
