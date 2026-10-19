import { COLORS } from '../../art/colors.js';
import { createRng, easeOutCubic } from '../../lib/math.js';
import { point } from '../painter.js';

const STAR = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
const DIAGONALS = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
];

// an expanding shock ring on big hits and knock-outs
function ring(painter, effect, progress) {
  const radius = (effect.big ? 6 : 4) + easeOutCubic(progress) * (effect.big ? 26 : 18);
  const size = progress < 0.5 ? 2 : 1;
  painter.alpha(Math.max(0, 1 - progress));
  for (let i = 0; i < 28; i++) {
    const angle = (i / 28) * Math.PI * 2;
    const x = effect.x + Math.cos(angle) * radius;
    painter
      .use(i % 2 ? effect.color : COLORS.white)
      .rect(x, effect.y + Math.sin(angle) * radius * 0.8, size, size);
  }
  painter.alpha(1);
}

// anime-style speed lines bursting from the hit
function lines(painter, effect, progress) {
  const random = createRng(effect.seed);
  painter.alpha(Math.max(0, 1 - progress) * 0.9);
  for (let i = 0; i < 12; i++) {
    const angle = random() * Math.PI * 2;
    const inner = 10 + effect.time * 4 + random() * 6;
    const outer = inner + 8 + random() * 10;
    const from = point(effect.x + Math.cos(angle) * inner, effect.y + Math.sin(angle) * inner);
    painter
      .use(COLORS.white)
      .line(from, point(effect.x + Math.cos(angle) * outer, effect.y + Math.sin(angle) * outer), 1);
  }
  painter.alpha(1);
}

function bladeCrescent(painter, effect) {
  const radius = (effect.big ? 9 : 7) + effect.time * 1.4;
  const centerX = effect.x - effect.direction * radius * 0.55;
  for (let i = 0; i <= 14; i++) {
    const angle = -1.15 + (i * 2.3) / 14;
    const x = centerX + Math.cos(angle) * radius * effect.direction;
    const y = effect.y + Math.sin(angle) * radius;
    const thickness = i > 3 && i < 11 ? 2 : 1;
    painter.use(effect.color).rect(x - 1, y - 1, thickness + 1, thickness + 1);
    if (i > 4 && i < 10) {
      painter.use(COLORS.white).rect(x - effect.direction, y, 1, 1);
    }
  }
}

function star(painter, effect, progress) {
  const radius = (effect.big ? 10 : 7) * (0.55 + progress * 0.7);
  const center = point(effect.x, effect.y);
  for (const [dx, dy] of STAR) {
    painter
      .use(effect.bladed ? COLORS.white : effect.color)
      .line(center, point(effect.x + dx * radius, effect.y + dy * radius), 1);
    const short = point(effect.x + dx * radius * 0.45, effect.y + dy * radius * 0.45);
    painter.use(effect.bladed ? COLORS.frost : effect.color).line(center, short, 3);
  }
  if (effect.big) {
    for (const [dx, dy] of DIAGONALS) {
      const from = point(effect.x + dx * 2, effect.y + dy * 2);
      painter
        .use(COLORS.white)
        .line(from, point(effect.x + dx * radius * 0.6, effect.y + dy * radius * 0.6), 1);
    }
  }
  painter.use(COLORS.white).diamond(effect.x, effect.y, 2);
}

function impact(painter, effect, progress) {
  if (effect.time < 2) {
    painter.use(COLORS.white).diamond(effect.x, effect.y, effect.big ? 6 : 4);
  }
  painter.alpha(Math.max(0, 1 - progress * progress));
  if (effect.bladed) {
    bladeCrescent(painter, effect);
  }
  star(painter, effect, progress);
  painter.alpha(1);
}

const DRAW_EFFECT = { ring, lines, impact };

export function drawEffects(painter, effects) {
  for (const effect of effects) {
    DRAW_EFFECT[effect.kind](painter, effect, effect.time / effect.duration);
  }
}
