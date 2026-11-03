import { project } from '../../camera.js';
import { DOG_SIZE } from '../scenery/dog.js';

// the dog keeps along the far side of the field, trotting after the ball and sitting down to watch
// when it has caught up; it moves on once a tick, from the match alone, so a replay runs it the same
const TROT = 1.7;
const LANE = -11;
const dogs = new WeakMap();

function dogOf(match) {
  if (!dogs.has(match)) {
    dogs.set(match, { tick: null, x: match.pitch.length * 0.4, facing: 1, moving: false });
  }

  return dogs.get(match);
}

function stepDog(dog, match, tick) {
  if (dog.tick === tick) {
    return;
  }

  const gap = match.ball.x - 60 * dog.facing - dog.x;

  dog.moving = Math.abs(gap) > 40;
  dog.x += dog.moving ? Math.sign(gap) * TROT : 0;
  dog.facing = dog.moving ? Math.sign(gap) : dog.facing;
  dog.tick = tick;
}

export function drawDog(context, { camera, match, tick, layers }) {
  const sprite = layers.sprites?.dog;
  const dog = dogOf(match);

  stepDog(dog, match, tick);

  const frame = dog.moving ? (tick >> 3) & 1 : 2;
  const canvas = sprite?.canvases[frame + (dog.facing < 0 ? 3 : 0)];
  const foot = project(camera, dog.x, LANE);

  if (canvas) {
    context.drawImage(
      canvas,
      Math.round(foot.x - DOG_SIZE.width / 2),
      Math.round(foot.y - DOG_SIZE.height),
    );
  }
}
