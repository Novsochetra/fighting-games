import { glints, scatter, withFade } from './fade.js';
import { drawSerpent, slither } from './serpent.js';

export const headAt = (scene) => (scene.hit ? scene.impact : scene.ball);

// the Naga rises from the kicker's foot with the ball in its jaws, its body of scales swimming
// up and over toward the goal
function front(pen, scene) {
  const points = slither(scene, { count: 24, spacing: 0.032, sway: 7 });

  withFade(pen, scene, () => {
    drawSerpent(pen, { points, art: scene.art, ball: headAt(scene), size: 1.9, thickness: 1.7 });
    glints(pen, { points, color: scene.art.body[4], tick: scene.tick });
  });
  scatter(pen, {
    scene,
    points,
    colors: [scene.art.body[4], scene.art.accent[3], scene.art.body[3]],
  });
}

export const NAGA = { front };
