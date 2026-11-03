import { SMALL_HEAD } from '../maps.js';
import { coilOf, drawHead, drawSerpentBody, hoodHeads } from './serpent.js';

// a neck of a few scales from the root of the hood up to its head
function drawNeck(context, head, art) {
  for (const share of [0.3, 0.55, 0.8]) {
    const x = Math.round(head.centre.x + (head.x - head.centre.x) * share);
    const y = Math.round(head.centre.y + (head.y - head.centre.y) * share);

    context.fillStyle = art.body[0];
    context.fillRect(x - 2, y - 2, 5, 5);
    context.fillStyle = art.body[2];
    context.fillRect(x - 1, y - 1, 3, 3);
  }
}

// the Seven-Headed Naga: a great gold body, and at the ball its hood of seven heads fanned up
export function drawSevenHeads(context, trail) {
  const { art } = trail;

  context.globalAlpha = trail.alpha;
  drawSerpentBody(context, coilOf(trail, { amplitude: 7 }), {
    art,
    width: (sample) => 3 + sample.t * 5,
  });

  for (const head of hoodHeads(trail)) {
    drawNeck(context, head, art);
    drawHead(context, trail, { map: SMALL_HEAD, at: head });
  }

  context.globalAlpha = 1;
}
