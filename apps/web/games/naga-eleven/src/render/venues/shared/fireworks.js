import { UI_SCALE, WORLD_VIEW } from '../../../config.js';
import { hash2 } from '../kit/hash.js';

// after a goal, bursts of fireworks over the stands: each burst opens out from its centre, slows,
// drops and fades through its colours; which and where are fixed by the tick it went up
const LIFE = 54;
// a burst goes up this often over a view of the HUD's width, more often over the world's wider one
const EVERY = Math.round(16 / UI_SCALE);
const SPARKS = 26;

function drawBurst(context, { x, y, age, colours }) {
  const open = 1 - (1 - age / LIFE) ** 3;
  const radius = 8 + open * 44;
  const drop = (age * age) / 140;
  const size = age < LIFE * 0.4 ? 2 : 1;

  for (const [ring, colour] of [
    [1, age < LIFE * 0.6 ? colours[1] : colours[0]],
    [0.62, colours[0]],
  ]) {
    context.fillStyle = colour;

    for (let i = 0; i < SPARKS; i += 1) {
      const angle = (i / SPARKS) * Math.PI * 2 + ring;
      const sparkX = Math.round(x + Math.cos(angle) * radius * ring);
      const sparkY = Math.round(y + Math.sin(angle) * radius * ring * 0.85 + drop);

      context.fillRect(sparkX, sparkY, size, size);
    }
  }
}

export function drawFireworks(context, { band, mood, colours }) {
  if (!mood.cheer) {
    return;
  }

  const newest = Math.floor(mood.sinceGoal / EVERY);

  for (let launch = Math.max(0, newest - Math.ceil(LIFE / EVERY)); launch <= newest; launch += 1) {
    const age = mood.sinceGoal - launch * EVERY;
    const x = 40 + hash2(launch, mood.goalTeam ?? 0, 81) * (WORLD_VIEW.width - 80);
    const y = band.top + hash2(launch, 2, 81) * (band.bottom - band.top);

    if (age >= 0 && age < LIFE) {
      drawBurst(context, { x, y, age, colours: colours[launch % colours.length] });
    }
  }
}
