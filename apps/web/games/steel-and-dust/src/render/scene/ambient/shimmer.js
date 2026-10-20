import { emitterSpots } from './emitters.js';
import { isOnScreen, trait, wrapX } from './motion.js';

const SALT = 19000;
const STRANDS = 7;
const DASHES = 3;

// a strand of hot air climbs from the spot and fades out at the top of the band; its dashes
// wobble sideways faster as it rises, which reads as the air rippling
function strandAt(spot, { strand, tick, effect }) {
  const seed = spot.index * 31 + strand + SALT;
  const climbed = wrapX(trait(seed, 1) * effect.height + tick * 0.22, effect.height);
  const y = Math.round(spot.y - climbed);
  const wobble = Math.round(Math.sin(tick * 0.16 + y * 0.7 + strand) * (1 + climbed / 10));
  return { y, wobble, seed, fade: 1 - climbed / effect.height };
}

function drawStrand(painter, spot, { y, wobble, seed, fade }, width) {
  painter.alpha(0.28 * fade);
  for (let dash = 0; dash < DASHES; dash++) {
    const length = 3 + Math.floor(trait(seed, dash + 2) * 5);
    const left = spot.x - width / 2 + ((dash + trait(seed, dash + 6)) * width) / DASHES + wobble;
    if (isOnScreen(left, y, length)) {
      painter.rect(left, y, length, 1);
    }
  }
}

// heat rising off molten metal and slag in the near layer, a band of rippling light
export function drawShimmer(painter, { effect, tick, cameraX, colors }) {
  painter.use(colors.shimmer);
  for (const spot of emitterSpots(effect, cameraX)) {
    for (let strand = 0; strand < STRANDS; strand++) {
      drawStrand(painter, spot, strandAt(spot, { strand, tick, effect }), effect.width);
    }
  }
  painter.alpha(1);
}
