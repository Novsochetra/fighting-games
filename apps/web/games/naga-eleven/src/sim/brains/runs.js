import { AI } from '../../data/tuning.js';
import { attackSign, goalLineOf, insidePitch, midY, progressOf } from '../pitch.js';
import { chance } from '../random.js';
import { opponentsOf, ownerOf } from '../squad.js';
import { distance } from '../vector.js';

const RUN_BEYOND = 170;
const ROOM_TO_PASS = 45;
const ROOM_BEHIND = 150;

const hasTime = (match, carrier) =>
  opponentsOf(match, carrier).every((opponent) => distance(opponent, carrier) > ROOM_TO_PASS);

// a forward goes beyond the last defender when a mate on the ball behind them has time to pass
function wantsToRun(match, player, carrier) {
  const team = player.team;
  const role = player.role === 'forward' ? 1 : 0.25;
  const ahead = progressOf(match, team, player.x) > progressOf(match, team, carrier.x);
  const lastLine = match.plans[team].lastLine;
  const room = Math.abs(goalLineOf(match, team) - lastLine) > ROOM_BEHIND;

  return (
    ahead &&
    room &&
    player.role !== 'defender' &&
    chance(match.random, AI.runChance * role) &&
    hasTime(match, carrier)
  );
}

export function startRun(match, player) {
  const carrier = ownerOf(match);

  if (!carrier || carrier.team !== player.team || !wantsToRun(match, player, carrier)) {
    return false;
  }

  const team = player.team;
  const x = match.plans[team].lastLine + attackSign(team) * RUN_BEYOND;
  const y = player.y + (midY(match) - player.y) * 0.3;
  const clear = 40;

  player.spot = insidePitch(match, { x, y }, clear);
  player.run = AI.runTicks;

  return true;
}
