export function pushEvent(match, event) {
  match.events ??= [];
  match.events.push(event);
}
