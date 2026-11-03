import { DUEL_UI } from '../../../art/duel/palette.js';
import { lerp } from '../hash.js';
import { GROUND } from '../paths.js';
import { disc } from '../shapes.js';
import { runnerAt, trailOf } from './runner.js';

const LEAP = 30;

// Hanuman, the wind's son, springs clean over the tackle and comes down running
function leapAt(scene, after) {
  const share = Math.max(0, Math.min(1, after));

  return {
    pose: share < 0.85 ? 'leap' : 'run',
    x: lerp(scene.impact.x - 20, 236, share),
    y: GROUND - Math.sin(Math.PI * share) * LEAP,
    facing: 1,
  };
}

const flies = (scene) => scene.hit && scene.attackWins;

const attacker = (scene) => (flies(scene) ? leapAt(scene, scene.after) : runnerAt(scene));

function ball(scene) {
  if (!flies(scene)) {
    return null;
  }

  const body = leapAt(scene, scene.after);

  return { x: body.x + 12, y: body.y - 6 };
}

// puffs of wind where he left the ground, and the copies of him he leaves in the air
function figures(pen, scene, runner, cast) {
  const tint = { body: scene.art.body[2], rim: scene.art.body[4] };
  const at = flies(scene)
    ? (i) => leapAt(scene, scene.after - i * 0.07)
    : (i) => ({ ...runnerAt(scene), x: runnerAt(scene).x - i * 9 });

  trailOf(pen, { at, count: 4, gap: 9, tint, cast });

  if (flies(scene) && scene.sinceHit < 24) {
    for (let i = 0; i < 4; i += 1) {
      disc(pen, {
        x: scene.impact.x - 24 + i * 7,
        y: GROUND - 2 - (i % 2) * 3,
        radius: 3 + scene.sinceHit / 5,
        color: DUEL_UI.white,
      });
    }
  }
}

export const HANUMAN = { attacker, ball, figures };
