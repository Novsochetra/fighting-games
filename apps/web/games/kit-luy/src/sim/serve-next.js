import { sit } from './arrivals.js';
import { startPatience } from './patience.js';

export function askNext(run) {
  if (run.queue.length === 0) {
    sit(run);
  }

  startPatience(run);
  run.events.push({ type: 'ask', customer: run.queue[0] });
}
