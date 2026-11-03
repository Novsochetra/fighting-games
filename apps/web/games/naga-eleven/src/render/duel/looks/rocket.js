import { DUEL_UI } from '../../../art/duel/palette.js';
import { hash } from '../hash.js';
import { trailPoint } from '../scene.js';
import { disc, polygon } from '../shapes.js';
import { withFade } from './fade.js';

const CONFETTI = 22;

// a tongue of flame licking back from the ball, its edge flickering every few ticks
function flame(pen, { at, direction, length, width, color, tick, seed }) {
  const wobble = (hash(seed, Math.floor(tick / 2)) - 0.5) * width;

  polygon(
    pen,
    [
      [at.x, at.y - width],
      [at.x - direction.x * length * 0.5, at.y - direction.y * length * 0.5 - width * 0.9 + wobble],
      [at.x - direction.x * length, at.y - direction.y * length + wobble],
      [at.x - direction.x * length * 0.5, at.y - direction.y * length * 0.5 + width * 0.9 + wobble],
      [at.x, at.y + width],
    ],
    color,
  );
}

function confetti(pen, scene) {
  for (let i = 0; i < CONFETTI; i += 1) {
    const at = trailPoint(scene, 0.05 + hash(i, 91) * 0.5);
    const drift = (scene.tick + i * 7) % 40;
    const colors = [
      scene.art.accent[1],
      scene.art.accent[2],
      scene.art.body[4],
      scene.art.accent[3],
    ];

    pen.rect(
      [at.x + hash(i, 92) * 10 - 5, at.y + drift * 0.6 - 6, 2, 1 + (i % 2)],
      colors[i % colors.length],
    );
  }
}

// the flame's layers, outermost first: how long and wide each is, and its shade of the ramp
const LAYERS = [
  { length: 1, width: 14, shade: 1 },
  { length: 0.78, width: 11, shade: 2 },
  { length: 0.52, width: 8, shade: 3 },
  { length: 0.3, width: 5, shade: 4 },
];

function headingOf(scene, at) {
  const behind = trailPoint(scene, 0.1);
  const span = Math.hypot(at.x - behind.x, at.y - behind.y) || 1;

  return { x: (at.x - behind.x) / span, y: (at.y - behind.y) / span };
}

// the Carnival Rocket roars in flat and fast on a trail of fire and confetti
function back(pen, scene) {
  const at = scene.hit ? scene.impact : scene.ball;
  const direction = headingOf(scene, at);
  const length = 50 + scene.approach * 70;

  withFade(pen, scene, () => {
    confetti(pen, scene);
    LAYERS.forEach((layer, seed) => {
      const color = scene.art.body[layer.shade];

      flame(pen, {
        at,
        direction,
        length: length * layer.length,
        width: layer.width,
        color,
        tick: scene.tick,
        seed,
      });
    });
    disc(pen, { ...at, radius: 9, color: scene.art.body[4] });
    disc(pen, { ...at, radius: 7, color: DUEL_UI.white });
  });
}

export const ROCKET = { back };
