import { flicker } from '../fine-pixels.js';
import { drawSpike } from './moss-spike.js';

// the Thornwood stirs round the Shade's feet as it winds up: bramble spikes push up, the inner ones
// first and tallest, their points glinting sky-blue as it strikes, then sink back into the ground
const SPOTS = [-15, -10, -6, 6, 10, 15];
const SINK_TICKS = 6;
const HOT_LEAD = 2;

// the inner spikes rise first and tallest, the outer ones later and shorter
const BANDS = [
  { within: 8, tall: 8, delay: 0 },
  { within: 12, tall: 6, delay: 0.25 },
  { within: Infinity, tall: 4, delay: 0.45 },
];

const SPIKES = SPOTS.map((dx, i) => {
  const band = BANDS.find(({ within }) => Math.abs(dx) < within);
  return { dx, tall: band.tall + Math.round(flicker(i, 5) * 2), delay: band.delay };
});

function growthOf(spike, { move, time }) {
  if (time < move.startup) {
    const share = (time + 1) / move.startup;
    return Math.max(0, Math.min(1, (share - spike.delay) / 0.45));
  }
  return Math.max(0, 1 - (time - move.startup) / SINK_TICKS);
}

function tipColor(i, { move, time, art, tickCount }) {
  const hot = time >= move.startup - HOT_LEAD && time < move.startup + HOT_LEAD;
  if (!hot) {
    return art.thornTip;
  }
  return flicker(i, tickCount >> 1) > 0.4 ? art.glow : art.bloom;
}

export function drawGrove(painter, layer) {
  const { fighter, art } = layer;
  if (fighter.airborne) {
    return;
  }
  SPIKES.forEach((spike, i) => {
    const height = Math.round(spike.tall * growthOf(spike, layer));
    if (height < 1) {
      return;
    }
    const lean = Math.sign(spike.dx);
    const tip = tipColor(i, layer);
    drawSpike(painter, { x: fighter.x + spike.dx, y: fighter.y, height, lean, art, tip });
  });
}
