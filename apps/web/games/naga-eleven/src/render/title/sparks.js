import { TITLE_ART } from '../../art/title/palette.js';
import { hash } from '../backdrops/hash.js';
import { artDot } from '../backdrops/pen.js';
import { nagaEyes } from './naga.js';

const art = TITLE_ART;

// embers rising off the Naga's light into the dusk, each on its own slow wander
export function drawEmbers(context, { layout, tick, count = 36 }) {
  for (let i = 0; i < count; i += 1) {
    const life = 300 + Math.floor(hash(i, 1) * 200);
    const age = (tick + Math.floor(hash(i, 2) * life)) % life;
    const x = layout.center + (hash(i, 3) - 0.5) * layout.width * 0.8 + Math.sin(age / 30 + i) * 4;
    const y = layout.horizon + 10 - age * (0.3 + hash(i, 4) * 0.25);

    if (y > 0) {
      artDot(context, { x, y }, art.embers[Math.min(3, Math.floor((age / life) * 4))]);
    }
  }
}

// one head and then another catches the light in its eyes
export function drawGlints(context, { layout, tick }) {
  const eyes = nagaEyes({ x: layout.center, y: layout.heart });
  const head = Math.floor(tick / 40) % 7;

  if (tick % 40 < 12) {
    eyes.slice(head * 2, head * 2 + 2).forEach((eye) => {
      artDot(context, eye, art.eye[1]);
      artDot(context, { x: eye.x, y: eye.y - 1 }, art.embers[0]);
    });
  }
}
