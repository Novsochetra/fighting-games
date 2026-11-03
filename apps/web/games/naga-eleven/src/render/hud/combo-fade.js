import { UI_SCALE } from '../../config.js';
import { BALL } from '../../data/tuning.js';
import { clamp } from '../../sim/vector.js';
import { project } from '../camera.js';
import { comboRect } from './layout.js';

// a combo counter is glass over the play: while the ball comes under it, it fades, by how near
const FADE = { from: 40, faintest: 0.25 };

function gapToBall(rect, ball) {
  const left = rect.x * UI_SCALE;
  const top = rect.y * UI_SCALE;
  const across = Math.max(0, left - ball.x, ball.x - (left + rect.width * UI_SCALE));
  const down = Math.max(0, top - ball.y, ball.y - (top + rect.height * UI_SCALE));

  return Math.hypot(across, down);
}

// how faint each side's counter is drawn this frame, [team 0, team 1]
export function comboAlphas(camera, match) {
  const ball = project(camera, match.ball.x, match.ball.y, Math.max(0, match.ball.z) + BALL.radius);

  return [0, 1].map((team) => {
    const gap = gapToBall(comboRect(match, team), ball);

    return FADE.faintest + (1 - FADE.faintest) * clamp(gap / FADE.from, 0, 1);
  });
}
