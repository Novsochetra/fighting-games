import {
  areasOf,
  acrossOf,
  attackSign,
  midX,
  midY,
  progressOf,
  xAtProgress,
  yAtAcross,
} from './pitch.js';
import { clamp } from './vector.js';

const KICKER_GAP = 12;

// how far each line slides with the ball, and the room it keeps up and down the pitch
const ROLES = {
  keeper: { slide: 0, least: 0.02, most: 0.2 },
  defender: { slide: 0.62, least: 0.06, most: 0.6 },
  midfielder: { slide: 0.72, least: 0.14, most: 0.8 },
  forward: { slide: 0.7, least: 0.3, most: 0.9 },
};

// a team with the ball spreads out and pushes up; without it the block drops, narrows and
// shifts across toward the ball
const SHAPES = {
  attack: { stretch: 1.12, push: 0.09, width: 1.15, pull: 0.2 },
  defend: { stretch: 0.86, push: -0.05, width: 0.8, pull: 0.32 },
};

export function homeSpot(match, player) {
  const { ball } = match;
  const shape = match.plans?.[player.team]?.attacking ? SHAPES.attack : SHAPES.defend;
  const role = ROLES[player.role];
  const ballAlong = progressOf(match, player.team, ball.x);
  const ballAcross = acrossOf(match, player.team, ball.y);
  const along = (player.slot.along - 0.3) * shape.stretch + 0.3 + (ballAlong - 0.5) * role.slide;
  const across = 0.5 + (player.slot.across - 0.5) * shape.width + (ballAcross - 0.5) * shape.pull;

  return {
    x: xAtProgress(match, player.team, clamp(along + shape.push, role.least, role.most)),
    y: yAtAcross(match, player.team, clamp(across, 0.05, 0.95)),
  };
}

export const kickerOf = (match, team) => match.sides[team][areasOf(match).kicker];

// each team lines up in its own half, the side not kicking off outside the centre circle and
// a little further back, so the kicker gets a touch before the press comes
export function kickoffSpot(match, player, kickingTeam) {
  if (player === kickerOf(match, kickingTeam)) {
    return { x: midX(match) - attackSign(player.team) * KICKER_GAP, y: midY(match) };
  }

  const kicking = player.team === kickingTeam;
  const circle = (areasOf(match).centreCircle + 20) / match.pitch.length;
  const most = kicking ? 0.47 : 0.5 - circle;
  const along = Math.min(player.slot.along * 0.85, most) - (kicking ? 0 : 0.03);

  return {
    x: xAtProgress(match, player.team, Math.max(along, 0.02)),
    y: yAtAcross(match, player.team, player.slot.across),
  };
}
