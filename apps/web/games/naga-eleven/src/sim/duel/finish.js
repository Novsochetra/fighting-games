import { DUELS } from '../../data/duels.js';
import { pushEvent } from './events.js';
import { FIELD_APPLIERS } from './finish-field.js';
import { afterOutcome } from './finish-play.js';
import { SHOT_APPLIERS } from './finish-shot.js';
import { forceChoices } from './force.js';

const APPLIERS = { ...FIELD_APPLIERS, ...SHOT_APPLIERS };

function actorsOf(match, outcome) {
  const at = (index) => (index === null ? null : match.players[index]);

  return {
    attacker: at(outcome.attacker),
    defender: at(outcome.defender),
    keeper: at(outcome.keeper),
    receiver: at(outcome.receiver),
    move: outcome.move,
  };
}

// the cut-in calls this when its show is over: the outcome is written into the match, which plays
// on (or, after a goal, goes to the goal phase as after any goal)
export function finishDuel(match) {
  const duel = match.duel;

  if (!duel) {
    return false;
  }

  forceChoices(match);

  const actors = actorsOf(match, duel.outcome);

  afterOutcome(match, actors, duel.outcome);

  const phase = APPLIERS[duel.outcome.result](match, actors, duel.outcome) ?? 'play';

  for (const player of [actors.attacker, actors.defender]) {
    Object.assign(player, { charge: 0, charging: null });
  }

  match.duel = null;
  match.duelMemory.quietUntil = match.tick + DUELS.quietTicks;
  match.phase = phase;
  match.phaseTicks = 0;
  pushEvent(match, { type: 'duelEnd', duel });

  return true;
}
