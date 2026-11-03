import { noise } from '../noise.js';
import { across } from '../paint.js';
import { drawBand } from './band.js';

const PIECES = 26;

const confettiColours = (art) => [
  art.body[3],
  art.accent[2],
  art.accent[3],
  art.body[4],
  art.eye[1],
];

// Samba: confetti of the carnival's colours thrown off behind, each piece spinning as it falls
export function drawConfetti(context, trail) {
  const { samples, tick, alpha, seed } = trail;
  const colours = confettiColours(trail.art);

  context.globalAlpha = alpha * 0.5;
  drawBand(context, samples, { colour: trail.art.accent[2], thickness: () => 1, from: 0.5 });
  context.globalAlpha = alpha;

  for (let i = 0; i < PIECES && samples.length > 0; i += 1) {
    const sample = samples[Math.floor(noise(seed, i) * samples.length)];
    const normal = across(sample);
    const off = (noise(seed, i + 40) - 0.5) * 30;
    const fall = ((tick + i * 5) % 28) * 0.5;
    const turn = (Math.floor(tick / 4) + i) % 3;

    context.fillStyle = colours[i % colours.length];
    context.fillRect(
      Math.round(sample.x + normal.x * off),
      Math.round(sample.y + normal.y * off + fall),
      [3, 2, 2][turn],
      [2, 2, 3][turn],
    );
  }

  context.globalAlpha = 1;
}

const ARC_POINTS = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

function drawGust(context, { centre, way, radius, colour }) {
  const normal = { x: -way.dy, y: way.dx };

  context.fillStyle = colour;

  for (const step of ARC_POINTS) {
    const angle = step * 0.3;
    const back = Math.cos(angle) * radius;
    const side = Math.sin(angle) * radius;
    const x = centre.x - way.dx * back + normal.x * side;
    const y = centre.y - way.dy * back + normal.y * side;

    const size = Math.abs(step) >= 3 ? 1 : 2;

    context.fillRect(Math.round(x), Math.round(y), size, size);
  }
}

// Hanuman's white wind: gusts curving round behind what it carries, and streaks of speed
export function drawWind(context, trail) {
  const { samples, art, alpha, tick } = trail;

  if (samples.length < 2) {
    return;
  }

  context.globalAlpha = alpha;

  for (const [share, radius] of [
    [0.95, 15],
    [0.72, 12],
    [0.5, 9],
    [0.3, 7],
  ]) {
    const sample = samples[Math.round(share * (samples.length - 1))];
    const pulse = (Math.floor(tick / 4) + radius) % 2;

    drawGust(context, { centre: sample, way: sample, radius: radius + pulse, colour: art.body[4] });
  }

  drawSpeedLines(context, trail);
  context.globalAlpha = 1;
}

function drawSpeedLines(context, { samples, art, tick }) {
  for (let i = 0; i < 3; i += 1) {
    const sample = samples[Math.floor(samples.length * (0.2 + i * 0.25))];
    const normal = across(sample);
    const off = (i - 1) * 12 + (tick % 2);
    const length = 14 + i * 5;

    context.fillStyle = i === 1 ? art.body[4] : art.body[3];
    context.fillRect(
      Math.round(sample.x + normal.x * off - (sample.dx < 0 ? 0 : length)),
      Math.round(sample.y + normal.y * off),
      length,
      1,
    );
  }
}
