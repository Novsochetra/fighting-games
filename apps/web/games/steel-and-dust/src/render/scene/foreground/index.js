import { hashInt } from '../../../lib/math.js';
import { drawFern } from './ferns.js';
import { drawRubble } from './rubble.js';
import { drawScrap } from './scrap.js';
import { drawScrub } from './scrub.js';
import { drawSpikes } from './spikes.js';

// a painted theme names its kind; the drawn desert roads have none and lie in rubble
const FOREGROUND_KINDS = {
  ferns: drawFern,
  rubble: drawRubble,
  scrub: drawScrub,
  scrap: drawScrap,
  spikes: drawSpikes,
};

// what lies in front of the fighters scrolls faster than the world, for depth
export function drawForeground(painter, cameraX, colors, tick) {
  const draw = FOREGROUND_KINDS[colors.kind] ?? drawRubble;
  const offset = cameraX * 1.25;
  const first = Math.floor(offset / 170) - 1;
  for (let i = first; i < Math.floor(offset / 170) + 4; i++) {
    const hash = hashInt(i + 500);
    if (hash % 3 === 0) {
      continue;
    }
    const x = i * 170 - offset + (hash % 60);
    draw(painter, x, { hash, colors, tick });
  }
}
