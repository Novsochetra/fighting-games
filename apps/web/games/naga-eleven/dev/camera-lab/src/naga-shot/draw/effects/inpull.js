import { hash } from '../../../../../../src/render/duel/hash.js';
import { SHOT_ART } from '../../colors.js';
import { easeIn } from '../../tracks/ease.js';
import { rampLine, stepped } from './kit.js';

const SPARK_RAMP = [SHOT_ART.emerald[2], SHOT_ART.emerald[3], SHOT_ART.gold[2], SHOT_ART.gold[3]];

const WIND_RAMP = [SHOT_ART.emerald[2], SHOT_ART.emerald[3], SHOT_ART.emerald[4], SHOT_ART.white];

const FLAT = 0.7;

function pulledSpark(pen, { ball, i, tick }) {
  const life = 20 + Math.round(hash(i, 91) * 12);
  const round = Math.floor((tick + hash(i, 92) * life) / life);
  const share = ((tick + hash(i, 92) * life) % life) / life;
  const angle = -Math.PI * 1.15 + hash(i, round, 93) * Math.PI * 1.3;
  const near = 58 * (1 - easeIn(share)) + 8;
  const tail = near + 3 + share * 14;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle) * FLAT;
  const head = { x: ball.x + cos * near, y: ball.y + sin * near };

  rampLine(pen, {
    head,
    tail: { x: ball.x + cos * tail, y: ball.y + sin * tail },
    ramp: SPARK_RAMP,
  });
  pen.rect([Math.round(head.x), Math.round(head.y), share > 0.5 ? 2 : 1, 1], SHOT_ART.white);
}

export function drawPulledSparks(pen, { ball, power, tick }) {
  const count = Math.round(3 + power * 13);

  for (let i = 0; i < count; i += 1) {
    pulledSpark(pen, { ball, i, tick });
  }
}

function windArc(pen, { ball, i, tick }) {
  const life = 34;
  const share = ((tick + hash(i, 95) * life) % life) / life;
  const start = hash(i, 96) * Math.PI * 2 + share * 2.6;
  const reach = 74 - 58 * easeIn(share);

  const steps = Math.round(reach * 1.1);

  for (let step = 0; step <= steps; step += 1) {
    const along = step / steps;
    const angle = start - along * 0.9;
    const radius = reach + along * 8;
    const x = Math.round(ball.x + Math.cos(angle) * radius);
    const y = Math.round(ball.y + Math.sin(angle) * radius * 0.42);

    pen.dot(x, y, stepped(WIND_RAMP, (1 - along) * (0.55 + share * 0.45)));
  }
}

export function drawWindSwirl(pen, { ball, power, tick }) {
  const count = Math.round(power * 6);

  for (let i = 0; i < count; i += 1) {
    windArc(pen, { ball, i, tick });
  }
}

export function drawConvergingStreaks(pen, { ball, pour }) {
  for (let i = 0; i < 14; i += 1) {
    const angle = (i / 14) * Math.PI * 2 + hash(i, 97) * 0.3;
    const near = (1 - easeIn(pour)) * (60 + hash(i, 98) * 30) + 6;
    const length = 10 + pour * 26;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle) * FLAT;

    rampLine(pen, {
      head: { x: ball.x + cos * near, y: ball.y + sin * near },
      tail: { x: ball.x + cos * (near + length), y: ball.y + sin * (near + length) },
      ramp: i % 3 === 0 ? SPARK_RAMP : WIND_RAMP,
    });
  }
}
