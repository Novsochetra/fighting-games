import { createSeen, rememberPlay } from './play-triggers.js';
import { conditionMet } from './triggers.js';

export const createWatch = (triggers = []) => ({
  triggers,
  fired: triggers.map(() => false),
  seen: createSeen(),
});

const outcomeOf = (trigger) => ({
  when: trigger.when,
  scene: trigger.scene ?? null,
  unlock: trigger.unlock ?? null,
  boost: trigger.boost ?? null,
});

// once a tick, with the events drained that tick; each trigger fires once a match, in the order
// the chapter lists them
export function checkTriggers(watch, match, events = match.events ?? []) {
  const fired = [];

  watch.triggers.forEach((trigger, i) => {
    if (!watch.fired[i] && conditionMet(trigger, match, events, watch.seen)) {
      watch.fired[i] = true;
      fired.push(outcomeOf(trigger));
    }
  });

  rememberPlay(watch.seen, match, events);

  return fired;
}
