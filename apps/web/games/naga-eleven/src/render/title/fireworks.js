import { hash } from '../backdrops/hash.js';
import { artDot } from '../backdrops/pen.js';

// bursts over the roof: each climbs, opens into a ring of sparks that falls and fades, then
// another goes up somewhere else
export function drawFireworks(context, { colors, tick, count = 3 }) {
  for (let i = 0; i < count; i += 1) {
    const life = 120;
    const age = (tick + i * 43) % life;
    const shot = Math.floor((tick + i * 43) / life);
    const center = {
      x: 40 + Math.floor(hash(i, shot, 1) * 300),
      y: 10 + Math.floor(hash(i, shot, 2) * 18),
    };
    const color = colors[Math.floor(hash(i, shot, 3) * colors.length)];

    if (age < 20) {
      artDot(context, { x: center.x, y: center.y + 40 - age * 2 }, colors[0]);
    } else if (age < 90) {
      const open = Math.min(1, (age - 20) / 18) * 14;

      for (let spark = 0; spark < 12; spark += 1) {
        const turn = (spark / 12) * Math.PI * 2;

        artDot(
          context,
          {
            x: center.x + Math.cos(turn) * open,
            y: center.y + Math.sin(turn) * open * 0.8 + (age - 20) * 0.12,
          },
          age > 70 && spark % 2 ? colors[3] : color,
        );
      }
    }
  }
}
