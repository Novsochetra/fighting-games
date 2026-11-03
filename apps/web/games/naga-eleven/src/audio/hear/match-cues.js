import { watchBall } from './ball-watch.js';
import { earFor } from './ear.js';
import { cuesOfEvent } from './event-cues.js';

// everything one tick of a match sounds as: its events, then what the ball did without one
export function matchCues(events, match, ear) {
  earFor(ear, match);

  const heard = events.flatMap((event) => cuesOfEvent(event, match, ear));

  return [...heard, ...watchBall(match, ear, events)];
}
