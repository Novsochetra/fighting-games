import { PENALTY_ART } from '../../art/duel/palette.js';
import { drawFigure } from './figure.js';
import { easeOut, hash, lerp, phaseOf } from './hash.js';
import { aimPoint, KEEPER_SPOT, SPOT } from './penalty-layout.js';
import { shadedDisc } from './parts.js';
import { BALL_ART } from '../../art/duel/looks.js';

const STRIKE = 12;
const FLIGHT = 16;

// where a kick that missed goes: over the bar or past a post, the same way for the same kick
function missPoint(kick) {
  const over = hash(kick.number, kick.team, 131) < 0.5;
  const aim = aimPoint(kick.aim, kick.power);

  return over ? { x: aim.x, y: 10 } : { x: 128 + (kick.aim || 1) * 118, y: aim.y };
}

function endOf(kick) {
  if (kick.result === 'missed') {
    return missPoint(kick);
  }

  if (kick.result === 'saved') {
    return { x: KEEPER_SPOT.x + kick.dive * 44, y: aimPoint(kick.aim, kick.power).y + 4 };
  }

  return aimPoint(kick.aim, kick.power);
}

export function ballAt(kick, ticks) {
  if (!kick || ticks < STRIKE) {
    return { ...SPOT, radius: 5 };
  }

  const share = easeOut(phaseOf(ticks, STRIKE, FLIGHT));
  const end = endOf(kick);

  return {
    x: lerp(SPOT.x, end.x, share),
    y: lerp(SPOT.y, end.y, share) - Math.sin(share * Math.PI) * 6,
    radius: lerp(5, 3, share),
  };
}

export function drawPenaltyBall(pen, at) {
  shadedDisc(pen, { x: at.x, y: at.y, radius: at.radius, ramp: BALL_ART.ramp });
}

// the keeper bounces on the line, then goes: left, right, or stands up tall in the middle
export function drawPenaltyKeeper(pen, { kick, ticks, tick }) {
  const share = kick ? easeOut(phaseOf(ticks, STRIKE - 4, FLIGHT)) : 0;
  const dive = kick?.dive ?? 0;
  const bounce = kick ? 0 : Math.abs(Math.sin(tick / 8)) * 2;

  if (dive === 0 || share === 0) {
    drawFigure(pen, {
      pose: 'front',
      x: KEEPER_SPOT.x,
      y: KEEPER_SPOT.y - bounce - share * 4,
      rim: PENALTY_ART.lights,
      body: PENALTY_ART.keeper,
    });

    return;
  }

  drawFigure(pen, {
    pose: 'frontDive',
    x: KEEPER_SPOT.x + dive * share * 16,
    y: KEEPER_SPOT.y + share * 8,
    facing: dive,
    rim: PENALTY_ART.lights,
    body: PENALTY_ART.keeper,
  });
}

// the kicker from behind, running in to the spot and striking
export function drawPenaltyShooter(pen, { kick, ticks }) {
  const running = !kick || ticks < STRIKE;
  const x = running ? lerp(70, 100, kick ? ticks / STRIKE : 0) : 100;

  drawFigure(pen, { pose: running ? 'windup' : 'kick', x, y: 136, facing: 1 });
}

export const PENALTY_STRIKE = STRIKE + FLIGHT;
