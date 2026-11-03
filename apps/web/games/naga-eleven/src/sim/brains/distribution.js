import { KEEPER } from '../../data/tuning.js';
import { attackSign, insidePitch } from '../pitch.js';
import { duoThrowOf } from './duo-throw.js';
import { bestPassOf } from './pass-options.js';
import { kick, standStill } from './steering.js';

const PUNT = 700;

// the keeper holds it a moment, faces up the pitch, then rolls it to a free defender or kicks
// it long to whoever is free up the pitch
export function distributeIntent(match, player) {
  const sign = attackSign(player.team);

  player.facing = { x: sign, y: 0 };

  if (player.holding < KEEPER.hold) {
    return standStill();
  }

  const duo = duoThrowOf(match, player, KEEPER.hold);

  if (duo) {
    return kick(duo);
  }

  const option = bestPassOf(match, player);

  if (option) {
    return kick({ kind: 'pass', target: option.target, spot: option.spot, lofted: option.lofted });
  }

  return kick({
    kind: 'clear',
    spot: insidePitch(match, { x: player.x + sign * PUNT, y: player.y }, 40),
  });
}
