import { DEFENDER, GROUND, KEEPER, KICKER } from './paths.js';

const runFrame = (tick) => (Math.floor(tick / 5) % 2 === 0 ? 'run' : 'run2');

// how many of the marks a count has passed: the frame of a move that steps on at each
const passed = (count, marks) => marks.filter((mark) => count >= mark).length;

// the tackle takes his feet: back onto the grass, then flat
const fallFrame = (scene) => passed(scene.sinceHit, [4, 9]);

function kicker(scene) {
  if (scene.t < 10) {
    return { pose: 'windup', x: KICKER.x, y: GROUND, facing: 1 };
  }

  if (scene.t >= 44) {
    return { pose: 'stand', x: KICKER.x, y: GROUND, facing: 1 };
  }

  // the strike, then the follow-through held as the ball flies
  return { pose: 'kick', frame: 1 + passed(scene.t, [16]), x: KICKER.x, y: GROUND, facing: 1 };
}

function dribbler(scene) {
  if (scene.hit && !scene.attackWins) {
    return {
      pose: 'fallen',
      frame: fallFrame(scene),
      x: scene.impact.x - 30,
      y: GROUND,
      facing: 1,
    };
  }

  return { pose: runFrame(scene.tick), x: scene.ball.x - 16, y: GROUND, facing: 1 };
}

export const attackerOf = (scene) =>
  scene.attack.kind === 'dribble' ? dribbler(scene) : kicker(scene);

const KEEPER_POSES = { goal: 'dive', saved: 'catch', parried: 'punch', wide: 'ready' };

function keeperOf(scene) {
  if (scene.approach < 0.7 && !scene.hit) {
    return { pose: 'ready', x: KEEPER.x, y: GROUND, facing: -1 };
  }

  // beaten, the keeper flies the wrong way: low, under the ball
  const diving = scene.word === 'goal';

  return {
    pose: KEEPER_POSES[scene.word] ?? 'catch',
    x: KEEPER.x + (diving ? 4 : 0),
    y: GROUND + (diving ? 4 : 0),
    facing: -1,
  };
}

const GUARDS = { tackle: 'slide', block: 'block', intercept: 'lunge' };

// a move's frames as he closes on the ball: down into the slide, then out at full stretch
const actingFrame = (pose, approach) =>
  pose === 'slide' ? passed(approach, [0.7, 0.85]) : 1 + passed(approach, [0.8]);

function closingDefender(scene) {
  const pose = GUARDS[scene.defend.kind] ?? 'block';
  const slide = pose === 'slide' ? Math.round((Math.min(scene.approach, 1) - 0.55) * 24) : 0;
  const frame = pose === 'block' ? undefined : actingFrame(pose, scene.approach);

  return { pose, frame, x: DEFENDER.x - Math.max(0, slide), y: GROUND, facing: -1 };
}

function fieldDefender(scene) {
  if (scene.hit && scene.word === 'broke') {
    return { pose: 'fallen', sheet: 'sat', x: DEFENDER.x + 14, y: GROUND, facing: -1 };
  }

  if (scene.hit && scene.word === 'stolen') {
    return { pose: 'slide', frame: 2, x: scene.ball.x + 22, y: GROUND, facing: -1 };
  }

  if (scene.approach > 0.55 || scene.hit) {
    return closingDefender(scene);
  }

  return { pose: 'stand', sheet: 'guard', x: DEFENDER.x, y: GROUND, facing: -1 };
}

export const defenderOf = (scene) => (scene.keeper ? keeperOf(scene) : fieldDefender(scene));
