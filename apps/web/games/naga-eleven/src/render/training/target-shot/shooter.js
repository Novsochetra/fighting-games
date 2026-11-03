import { BAR, CARD } from '../../../art/training/cards.js';
import { CHALK } from '../../../art/training/ground.js';
import { DRILLS } from '../../../data/training.js';
import { powerOf } from '../../../training/target-shot/shot.js';
import { drawBall } from '../ball.js';
import { drawFootballer, kickOf } from '../footballer.js';
import { drawShadow } from '../people.js';
import { paint } from '../pixels.js';
import { isDrifting, shooterPose } from './pose.js';
import { ballStart, SHOOTER, shooterX } from './view.js';

const TUNING = DRILLS['target-shot'].tuning;
const GAUGE = { height: 36, width: 4, gap: 28 };

function drawGauge(context, { x, power }) {
  const bottom = SHOOTER.y - 4;
  const top = bottom - GAUGE.height;
  const fill = Math.round(power * GAUGE.height);
  const sweetTop = bottom - Math.round(TUNING.sweetHigh * GAUGE.height);
  const sweetBottom = bottom - Math.round(TUNING.sweetLow * GAUGE.height);

  paint(context, CARD.shadow, [x - 1, top - 1, GAUGE.width + 2, GAUGE.height + 2]);
  paint(context, BAR.back, [x, top, GAUGE.width, GAUGE.height]);
  paint(context, BAR.sweet, [x, sweetTop, GAUGE.width, sweetBottom - sweetTop]);
  paint(context, power > TUNING.sweetHigh ? BAR.hot : BAR.fill, [
    x + 1,
    bottom - fill,
    GAUGE.width - 2,
    fill,
  ]);
  paint(context, CARD.text, [x - 2, sweetTop, 1, sweetBottom - sweetTop]);
}

// while the run carries him sideways, his line is chalked on the grass
function drawTrack(context, { x }) {
  for (let dx = -40; dx <= 40; dx += 6) {
    paint(context, CHALK.shade, [x + dx - (x % 6), SHOOTER.y + 2, 3, 1]);
  }
}

function drawRack(context, run) {
  const left = run.shot + (run.ball ? 1 : 0);

  for (let i = 0; i < TUNING.shots - left; i += 1) {
    drawShadow(context, { x: 60 + i * 8, y: 213, width: 3, alpha: 0.3 });
    drawBall(context, { x: 60 + i * 8, y: 210, radius: 3, travel: i * 3 });
  }
}

export function drawShooter(context, state, actors) {
  const run = state.run;
  const x = shooterX(run);

  drawRack(context, run);

  if (isDrifting(state)) {
    drawTrack(context, { x });
  }

  if (run.stage === 'aim') {
    const ball = ballStart(run);

    drawShadow(context, { x: ball.x + 1, y: ball.y + 4, width: 4, alpha: 0.35 });
    drawBall(context, { x: ball.x, y: ball.y, radius: 3, travel: 0 });
  }

  drawFootballer(context, { actors, pose: shooterPose(state, kickOf(actors)), x, y: SHOOTER.y });

  if (run.charge > 0) {
    drawGauge(context, { x: x + GAUGE.gap, power: powerOf(run.charge, TUNING) });
  }
}
