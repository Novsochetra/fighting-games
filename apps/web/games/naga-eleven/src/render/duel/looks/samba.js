import { band } from '../shapes.js';
import { runnerAt, trailOf } from './runner.js';

// the dribbler sways as they run, side to side to the drum
function sway(scene, at) {
  return at.pose === 'fallen' ? at : { ...at, y: at.y + Math.round(Math.sin(scene.tick / 4) * 2) };
}

const attacker = (scene) => sway(scene, runnerAt(scene));

// ribbons of the carnival's colours wave out behind the samba
function ribbons(pen, scene, at) {
  const colors = [scene.art.body[3], scene.art.accent[2], scene.art.eye[1]];

  colors.forEach((color, i) => {
    for (let x = 0; x < 60; x += 4) {
      const wave = Math.sin((x + scene.tick * 3) / 9 + i * 2) * 5;
      const from = { x: at.x - x, y: at.y - 20 + i * 6 + wave };
      const to = {
        x: at.x - x - 4,
        y: at.y - 20 + i * 6 + Math.sin((x + 4 + scene.tick * 3) / 9 + i * 2) * 5,
      };

      band(pen, { from, to, width: 3 - x / 30, color });
    }
  });
}

// Samba Mirage: a swaying run that leaves its colours, and copies of itself, hanging in the air
function figures(pen, scene, runner, cast) {
  const at = attacker(scene);

  if (at.pose === 'fallen') {
    return;
  }

  ribbons(pen, scene, at);

  const tints = [scene.art.body[2], scene.art.accent[1], scene.art.eye[1]];

  [1, 2, 3].forEach((i) => {
    trailOf(pen, {
      at: () => ({
        ...at,
        x: at.x - i * 11,
        y: at.y + Math.round(Math.sin((scene.tick - i * 6) / 4) * 3),
      }),
      count: 1,
      gap: 11,
      tint: { body: tints[i - 1], rim: scene.art.body[4] },
      cast,
    });
  });
}

export const SAMBA = { attacker, figures };
