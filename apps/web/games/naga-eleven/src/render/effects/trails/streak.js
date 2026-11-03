import { noise } from '../noise.js';
import { blockBetween, drawBand } from './band.js';

// today's hot streak: a glow, a body and a white core, each thicker toward the ball
export function drawStreak(context, trail) {
  const { samples, art, alpha } = trail;

  context.globalAlpha = alpha * 0.35;
  drawBand(context, samples, { colour: art.body[2], thickness: (sample) => 3 + sample.t * 13 });
  context.globalAlpha = alpha * 0.7;
  drawBand(context, samples, { colour: art.body[3], thickness: (sample) => 2 + sample.t * 8 });
  context.globalAlpha = alpha;
  drawBand(context, samples, {
    colour: art.body[4],
    thickness: (sample) => 1 + sample.t * 4,
    from: 0.3,
  });
  context.globalAlpha = 1;
}

const twistOf = (trail, sample) => Math.sin(sample.t * 10 - trail.tick * 0.28);

// a ribbon twisting along a bending pass: its face and its back turn by turns as it goes
export function drawRibbon(context, trail) {
  const { samples, art, alpha } = trail;

  for (let i = 0; i < samples.length - 1; i += 1) {
    const sample = samples[i];
    const twist = twistOf(trail, sample);
    const width = 1 + Math.abs(twist) * (2 + sample.t * 3);

    context.globalAlpha = alpha * (0.4 + sample.t * 0.6);
    context.fillStyle = twist > 0 ? art.body[3] : art.accent[2];
    blockBetween(context, sample, samples[i + 1], { width });

    if (width > 3) {
      context.fillStyle = art.body[4];
      blockBetween(context, sample, samples[i + 1], { width: 1, shift: width / 2 - 1 });
    }
  }

  context.globalAlpha = 1;
}

// a flame licking up off the path, its tongues flickering, embers over it
export function drawFlame(context, trail) {
  const { samples, art, alpha, tick } = trail;
  const flicker = Math.floor(tick / 3);

  for (let i = 0; i < samples.length - 1; i += 1) {
    const sample = samples[i];
    const height = (3 + sample.t * 11) * (0.55 + noise(flicker, i) * 0.45);
    const next = samples[i + 1];

    context.globalAlpha = alpha * (0.5 + sample.t * 0.5);
    context.fillStyle = art.body[2];
    blockBetween(context, sample, next, { width: height, shift: height / 2 - 2 });
    context.fillStyle = art.body[3];
    blockBetween(context, sample, next, { width: height * 0.6, shift: height * 0.3 - 2 });
    context.fillStyle = art.body[4];
    blockBetween(context, sample, next, { width: height * 0.3, shift: height * 0.15 - 2 });

    if (i % 3 === flicker % 3) {
      context.fillStyle = art.accent[3];
      context.fillRect(Math.round(sample.x), Math.round(sample.y - height - 3), 1, 1);
    }
  }

  context.globalAlpha = 1;
}
