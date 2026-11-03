import { AURA, FIREFLY, PETAL } from '../../../art/training/temple.js';
import { ART_VIEW, faded, noise, oval, paint, pulse } from '../pixels.js';

const LAYERS = [
  [AURA.deep, 1, 0.16],
  [AURA.mid, 0.78, 0.2],
  [AURA.light, 0.55, 0.26],
  [AURA.core, 0.3, 0.3],
];

function drawGlow(context, { x, y, radius }) {
  for (const [color, size, alpha] of LAYERS) {
    faded(context, alpha, () =>
      oval(context, color, {
        x,
        y,
        radiusX: Math.round(radius * size),
        radiusY: Math.round(radius * size * 1.15),
      }),
    );
  }
}

// tongues of gold rising off the aura's edge
function drawFlames(context, { x, y, radius, tick, count }) {
  for (let i = 0; i < count; i += 1) {
    const across = Math.round((noise(i) * 2 - 1) * radius * 0.8);
    const life = (tick * 0.7 + i * 17) % (radius * 1.4);
    const top = Math.round(y + radius * 0.6 - life);

    faded(context, 1 - life / (radius * 1.4), () => {
      paint(context, AURA.mid, [x + across - 1, top, 3, 4]);
      paint(context, AURA.core, [x + across, top + 1, 1, 2]);
    });
  }
}

// his spirit, round him: bigger with each beat kept, burning brighter with the streak
export function drawAura(context, { x, y, spirit, tick }) {
  if (spirit <= 0) {
    return;
  }

  const radius = 12 + spirit * 0.42 + pulse(tick, 50) * 2;

  drawGlow(context, { x, y, radius });
  drawFlames(context, { x, y, radius, tick, count: Math.round(spirit / 7) });
}

// the burst at the end, as wide as the score was high
export function drawBurst(context, { x, y, share, since }) {
  const grow = Math.min(1, since / 24);
  const radius = 16 + share * 150 * grow;

  faded(context, Math.max(0, 0.7 - since / 40), () =>
    oval(context, AURA.core, { x, y, radiusX: Math.round(radius), radiusY: Math.round(radius) }),
  );

  for (let i = 0; i < 16; i += 1) {
    const angle = (i / 16) * Math.PI * 2 + since * 0.004;
    const reach = radius * (0.6 + noise(i) * 0.6);

    faded(context, Math.max(0, 1 - since / 120), () => {
      for (let step = 8; step < reach; step += 3) {
        paint(context, i % 2 === 0 ? AURA.light : AURA.mid, [
          x + Math.cos(angle) * step,
          y + Math.sin(angle) * step,
          2,
          2,
        ]);
      }
    });
  }

  drawAura(context, { x, y, spirit: 30 + share * 70, tick: since });
}

// fireflies and lotus petals adrift in the dawn
export function drawDrift(context, { tick }) {
  for (let i = 0; i < 14; i += 1) {
    const x = (noise(i) * ART_VIEW.width + tick * (0.1 + noise(i + 4) * 0.2)) % ART_VIEW.width;
    const y = 60 + noise(i + 8) * 130 + (pulse(tick + i * 37, 160) - 0.5) * 10;
    const petal = i % 3 === 0;

    faded(context, petal ? 0.9 : 0.4 + pulse(tick + i * 11, 40) * 0.6, () =>
      paint(context, petal ? PETAL[i % 2] : FIREFLY, [x, y, petal ? 2 : 1, 1]),
    );
  }
}
