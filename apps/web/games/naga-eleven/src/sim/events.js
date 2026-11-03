// an app that never drains them (a match played behind the title) must not hold on to them all
const MOST_HELD = 256;

export function pushEvent(match, event) {
  match.events.push(event);

  if (match.events.length > MOST_HELD) {
    match.events.shift();
  }
}

export function drainEvents(match) {
  const drained = match.events;

  match.events = [];

  return drained;
}
