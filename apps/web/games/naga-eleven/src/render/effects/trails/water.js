import { blockBetween, drawBand } from './band.js';

const DASH = 12;
const MOST_DASHES = 48;

const lengthOf = (river) =>
  river.slice(1).reduce((sum, to, i) => sum + Math.hypot(to.x - river[i].x, to.y - river[i].y), 0);

// the passes before the shot, a dotted run of shimmering water from each to the next, the light
// flowing along it toward the ball; a long run spaces its dashes out so it never costs more
function drawPassRiver(context, { river, art, tick }) {
  const gap = Math.max(DASH, lengthOf(river) / MOST_DASHES);

  for (let i = 1; i < river.length; i += 1) {
    const from = river[i - 1];
    const to = river[i];
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    const flow = (tick * 0.8) % gap;

    for (let along = flow; along < length; along += gap) {
      const x = Math.round(from.x + ((to.x - from.x) * along) / length);
      const y = Math.round(from.y + ((to.y - from.y) * along) / length);

      context.fillStyle = art.body[2];
      context.fillRect(x - 2, y, 5, 2);
      context.fillStyle = (along + i) % (gap * 3) < gap ? art.accent[3] : art.body[4];
      context.fillRect(x - 1, y, 2, 1);
    }
  }
}

// the Mekong Current: a river of light along the passes that built the combo and on behind the
// ball, glints of the low sun running down it
export function drawRiver(context, trail) {
  const { art, alpha, tick, samples } = trail;

  context.globalAlpha = alpha * 0.85;
  drawPassRiver(context, { river: trail.river ?? [], art, tick });
  context.globalAlpha = alpha * 0.55;
  drawBand(context, samples, { colour: art.body[1], thickness: (sample) => 4 + sample.t * 8 });
  context.globalAlpha = alpha * 0.85;
  drawBand(context, samples, { colour: art.body[2], thickness: (sample) => 2 + sample.t * 6 });
  drawBand(context, samples, {
    colour: art.body[3],
    thickness: () => 1,
    offset: (sample) => 1 + sample.t * 2,
  });
  context.globalAlpha = alpha;

  for (let i = (Math.floor(tick / 2) % 4) + 1; i < samples.length - 1; i += 4) {
    context.fillStyle = i % 2 ? art.body[4] : art.accent[3];
    context.fillRect(Math.round(samples[i].x), Math.round(samples[i].y), 2, 1);
  }

  context.globalAlpha = 1;
}

// a wave rising behind the ball, its crest curling over it in foam, spray thrown off the top
const RISE_TICKS = 18;
const TALLEST = 26;

const shapeAt = (along) => (along < 0.85 ? ((along - 0.2) / 0.65) ** 1.6 : 1 - (along - 0.85) * 3);

export function drawWave(context, trail) {
  const { samples, art, alpha, age, tick } = trail;
  const tallest = TALLEST * Math.min(1, (age + 4) / RISE_TICKS);

  context.globalAlpha = alpha;

  for (let i = 0; i < samples.length - 1; i += 1) {
    const sample = samples[i];

    if (sample.t >= 0.2) {
      const height = Math.max(2, tallest * shapeAt(sample.t));
      const next = samples[i + 1];
      const foam = Math.min(3, height / 4);

      context.fillStyle = art.body[2];
      blockBetween(context, sample, next, { width: height, shift: height / 2 - 2 });
      context.fillStyle = art.body[3];
      blockBetween(context, sample, next, { width: height * 0.35, shift: height * 0.8 - 2 });
      context.fillStyle = art.body[4];
      blockBetween(context, sample, next, { width: foam, shift: height - foam / 2 - 2 });

      drawSpray(context, { sample, height, art, tick, i });
    }
  }

  context.globalAlpha = 1;
}

function drawSpray(context, { sample, height, art, tick, i }) {
  if ((i + Math.floor(tick / 3)) % 4 !== 0 || height < 10) {
    return;
  }

  context.fillStyle = art.body[4];
  context.fillRect(Math.round(sample.x), Math.round(sample.y - height - 4 - (tick % 3)), 1, 1);
}
