import { ballAt } from '../tracks/ball.js';
import { MANIFEST } from '../tracks/naga.js';
import { playerAt } from '../tracks/player.js';
import { CONTACTS, GOAL, GROUND, KEEPER_SPOT } from '../world.js';

// the points a shot may look at, in the world's art pixels, for this moment of the show
export function pointsAt(clock, ending) {
  const player = playerAt(clock, ending);
  const ball = ballAt(clock, ending);

  return {
    play: { x: (player.x + ball.x) / 2 + 30, y: GROUND - 56 },
    player: { x: player.x + 4, y: GROUND - 34 },
    kick: { x: (player.x + ball.x) / 2 + 4, y: GROUND - 24 },
    ball,
    ahead: { x: ball.x + 48, y: ball.y - 6 },
    naga: { x: MANIFEST.x + 26, y: GROUND - 64 },
    rise: { x: MANIFEST.x + 22, y: GROUND - 74 },
    keeper: { x: KEEPER_SPOT.x - 8, y: GROUND - 36 },
    goal: { x: GOAL.line + 6, y: GROUND - 42 },
    contact: CONTACTS[ending],
    settle: { x: (ball.x + KEEPER_SPOT.x) / 2, y: GROUND - 36 },
    rest: { x: ball.x - 40, y: GROUND - 56 },
  };
}
