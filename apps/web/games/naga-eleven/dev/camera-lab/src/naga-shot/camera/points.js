import { ballAt } from '../tracks/ball.js';
import { MANIFEST } from '../tracks/naga.js';
import { playerAt } from '../tracks/player.js';
import { CONTACTS, GOAL, GROUND, KEEPER_SPOT } from '../world.js';

const heroOf = ({ ending, player, rebound }) =>
  ending === 'goal' ? { x: player.x + 4, y: GROUND - 52 } : rebound;

const restOf = ({ ending, player, ball }) =>
  ending === 'goal' ? { x: player.x + 60, y: GROUND - 56 } : { x: ball.x - 40, y: GROUND - 56 };

export function pointsAt(clock, ending) {
  const player = playerAt(clock, ending);
  const ball = ballAt(clock, ending);
  const crash = CONTACTS[ending];
  const settle = { x: (ball.x + KEEPER_SPOT.x) / 2, y: GROUND - 36 };
  const rebound = { x: (crash.x + ball.x) / 2, y: (crash.y + ball.y) / 2 };

  return {
    play: { x: (player.x + ball.x) / 2 + 30, y: GROUND - 56 },
    player: { x: player.x + 4, y: GROUND - 34 },
    kick: { x: (player.x + ball.x) / 2 + 4, y: GROUND - 24 },
    ball,
    ahead: { x: ball.x + 48, y: ball.y - 6 },
    trail: { x: ball.x - 40, y: ball.y + 8 },
    naga: { x: MANIFEST.x + 6, y: GROUND - 62 },
    rise: { x: MANIFEST.x + 6, y: GROUND - 68 },
    keeper: { x: KEEPER_SPOT.x - 8, y: Math.min(GROUND - 36, crash.y + 26) },
    goal: { x: GOAL.line + 6, y: GROUND - 42 },
    contact: crash,
    settle,
    rebound,
    hero: heroOf({ ending, player, rebound }),
    rest: restOf({ ending, player, ball }),
  };
}
