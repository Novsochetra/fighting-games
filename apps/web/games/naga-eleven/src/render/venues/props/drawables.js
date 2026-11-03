import { WORLD_VIEW } from '../../../config.js';
import { project } from '../../camera.js';
import { hash2 } from '../kit/hash.js';

// the venue's small props on the ground round the pitch (corner flags, photographers), each a
// sprite with its foot at a world point, sorted by depth with the players. `cheer` is the drawing
// a prop shows while the crowd cheers, and it shows it on and off, as a flash goes
function frameOf(prop, sprite, { mood, tick }) {
  const turns = (sprite.frames ?? 1) > 1 && prop.cheer === undefined;

  if (prop.cheer !== undefined && mood.cheer) {
    return hash2(tick >> 2, Math.round(prop.x + prop.y), 5) < 0.3 ? prop.cheer : 0;
  }

  return turns ? Math.floor((tick + prop.x) / (prop.every ?? 12)) % sprite.frames : 0;
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
    ...spots.map((y) => ({ sprite: 'photographer', x: -goal.depth - 30, y, facing: 1, cheer: 1 })),
    ...spots.map((y) => ({
      sprite: 'photographer',
      x: pitch.length + goal.depth + 30,
      y,
      facing: -1,
      cheer: 1,
    })),
  ];
}
