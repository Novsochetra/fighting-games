import { WORLD_VIEW } from '../../../config.js';
import { project } from '../../camera.js';
import { hash2 } from '../kit/hash.js';

// a photographer fires at every chance while the crowd cheers a goal, and in open play in bursts
// of two flashes: often while the play is near the goal he kneels behind (the crowd's excited
// share of the pitch), now and then elsewhere. Each chance is a hash of the tick and his place,
// so a frame drawn twice flashes the same
const BURST_ODDS = { near: 0.06, far: 0.008 };
const NEAR_GOAL = 0.18;

function nearHisGoal(prop, { match }) {
  const pitch = match?.pitch;
  const ball = match?.ball;

  if (!pitch || !ball) {
    return false;
  }

  const line = prop.x < pitch.length / 2 ? 0 : pitch.length;

  return Math.abs(ball.x - line) < pitch.length * NEAR_GOAL;
}

export function isFlashing(prop, scene) {
  const seed = Math.round(prop.x + prop.y);

  if (scene.mood.cheer) {
    return hash2(scene.tick >> 2, seed, 5) < 0.3;
  }

  const odds = nearHisGoal(prop, scene) ? BURST_ODDS.near : BURST_ODDS.far;

  return hash2(scene.tick >> 4, seed, 6) < odds && ((scene.tick >> 2) & 1) === 0;
}

// the venue's small props on the ground round the pitch (corner flags, photographers), each a
// sprite with its foot at a world point, sorted by depth with the players. `flash` is the drawing
// a photographer shows as his flash fires
function frameOf(prop, sprite, scene) {
  if (prop.flash !== undefined) {
    return isFlashing(prop, scene) ? prop.flash : 0;
  }

  const turns = (sprite.frames ?? 1) > 1;

  return turns ? Math.floor((scene.tick + prop.x) / (prop.every ?? 12)) % sprite.frames : 0;
}

export function propDrawables(scene, props) {
  return props.flatMap((prop) => {
    const sprite = scene.layers.sprites[prop.sprite];

    if (!sprite) {
      return [];
    }

    const index = frameOf(prop, sprite, scene) + (prop.facing < 0 ? sprite.frames : 0);
    const canvas = sprite.canvases[index];
    const foot = project(scene.camera, prop.x, prop.y);
    const left = Math.round(foot.x - sprite.width / 2);
    const top = Math.round(foot.y - sprite.height);

    if (
      !canvas ||
      left > WORLD_VIEW.width ||
      left + sprite.width < 0 ||
      top > WORLD_VIEW.height ||
      top + sprite.height < 0
    ) {
      return [];
    }

    return [{ depth: prop.y, draw: (context) => context.drawImage(canvas, left, top) }];
  });
}

export const cornerFlags = ({ pitch }) =>
  [0, pitch.length].flatMap((x) =>
    [0, pitch.width].map((y) => ({ sprite: 'flag', x, y, facing: 1, every: 10 })),
  );

// photographers crouch along both goal lines either side of the goal, looking at the pitch
export function photographers({ pitch, goal }) {
  const mouth = { far: pitch.width / 2 - goal.width / 2, near: pitch.width / 2 + goal.width / 2 };
  const spots = [mouth.far - 110, mouth.far - 60, mouth.near + 70, mouth.near + 130];

  return [
    ...spots.map((y) => ({ sprite: 'photographer', x: -goal.depth - 30, y, facing: 1, flash: 1 })),
    ...spots.map((y) => ({
      sprite: 'photographer',
      x: pitch.length + goal.depth + 30,
      y,
      facing: -1,
      flash: 1,
    })),
  ];
}
