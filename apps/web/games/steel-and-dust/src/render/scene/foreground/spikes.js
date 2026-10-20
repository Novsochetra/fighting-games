import { VIEW_HEIGHT } from '../../../config.js';

const STAKE_GAP = 8;

// an iron stake driven into the road: its upper half leans off true, one edge and the point
// catch the red light
function drawStake(painter, x, { height, lean, colors }) {
  const top = VIEW_HEIGHT - height;
  const middle = top + Math.round(height / 2);
  painter.use(colors.spike).rect(x, middle, 4, VIEW_HEIGHT - middle);
  painter.rect(x + lean, top + 3, 3, middle - top - 3);
  painter.rect(x + lean + 1, top, 1, 3);
  painter.use(colors.spikeLight).rect(x + lean + 2, top + 3, 1, middle - top - 3);
  painter.rect(x + 3, middle, 1, VIEW_HEIGHT - middle);
  painter.rect(x + lean + 1, top, 1, 1);
}

// a skull spiked on a stake's point: a bone dome with two dark eye holes and a row of teeth
function drawSkull(painter, x, y, colors) {
  painter
    .use(colors.bone)
    .rect(x, y, 5, 3)
    .rect(x + 1, y - 1, 3, 1)
    .rect(x + 1, y + 3, 3, 1);
  painter
    .use(colors.spike)
    .rect(x + 1, y + 1, 1, 1)
    .rect(x + 3, y + 1, 1, 1);
  painter.rect(x + 2, y + 3, 1, 1);
}

// a chain hangs between two stakes in links of two pixels and swings a little in the wind
function drawChain(painter, { from, to, sag, colors }) {
  painter.use(colors.chain);
  const span = to.x - from.x;
  for (let step = 0; step <= span; step += 2) {
    const progress = step / span;
    const y = from.y + (to.y - from.y) * progress + Math.sin(progress * Math.PI) * sag;
    painter.rect(from.x + step, y, step % 4 ? 1 : 2, step % 4 ? 2 : 1);
  }
}

function stakeOf(hash, i) {
  const bits = hash >>> (i * 4);
  return { height: 14 + (bits % 11), lean: (bits & 8 ? 1 : -1) * (1 + ((bits >>> 1) & 1)) };
}

export function drawSpikes(painter, x, { hash, colors, tick }) {
  const count = 3 + (hash % 3);
  const stakes = Array.from({ length: count }, (_, i) => stakeOf(hash, i));
  stakes.forEach((stake, i) => drawStake(painter, x + i * STAKE_GAP, { ...stake, colors }));
  const last = stakes.length - 1;
  const anchorY = (stake) => VIEW_HEIGHT - Math.round(stake.height * 0.55);
  drawChain(painter, {
    from: { x: x + 2, y: anchorY(stakes[0]) },
    to: { x: x + last * STAKE_GAP + 2, y: anchorY(stakes[last]) },
    sag: 4 + Math.sin(tick / 40 + hash) * 1.5,
    colors,
  });
  if (hash & 16) {
    const crowned = stakes[1];
    drawSkull(painter, x + STAKE_GAP + crowned.lean - 1, VIEW_HEIGHT - crowned.height + 1, colors);
  }
}
