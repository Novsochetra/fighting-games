import { stickOf } from './stick.js';
import { leadOf, opennessOf, passTargetOf } from './passing.js';
import { attackSign } from './pitch.js';
import { teammatesOf } from './squad.js';
import { distance } from './vector.js';

const HEADER_REACH = 240;
const FREE = 50;

function openMateAhead(match, player) {
  const sign = attackSign(player.team);
  let best = null;
  let bestRoom = FREE;

  for (const mate of teammatesOf(match, player)) {
    const ahead = (mate.x - player.x) * sign > 0;
    const room = opennessOf(match, mate, mate.team);

    if (ahead && room > bestRoom && distance(mate, player) < HEADER_REACH) {
      best = mate;
      bestRoom = room;
    }
  }

  return best;
}

// where a header goes on to: a mate's run, along the stick for the one the player steers
export function headerPassOf(match, player) {
  const stick = player.index === match.controlled ? stickOf(match.input) : null;
  const aimed = stick && (stick.x !== 0 || stick.y !== 0);
  const mate = aimed ? passTargetOf(match, player, stick) : openMateAhead(match, player);

  return mate ? leadOf(match, mate, match.ball) : null;
}
