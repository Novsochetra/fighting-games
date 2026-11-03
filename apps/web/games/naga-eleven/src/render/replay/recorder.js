import { TICKS_PER_SECOND } from '../../config.js';
import { plainCopy } from './copy.js';
import { castOf, cloneSnapshot, createSnapshot, writeSnapshot } from './snapshot.js';

// the last `seconds` of play on a loop of tape: a ring of snapshots written over in place
export function createRecorder({ seconds = 5 } = {}) {
  const size = Math.max(2, Math.round(seconds * TICKS_PER_SECOND));

  return { size, slots: [], next: 0, count: 0, cast: null, lastTick: null, held: [] };
}

export function clearRecorder(recorder) {
  Object.assign(recorder, { next: 0, count: 0, cast: null, lastTick: null, held: [] });
}

// a new match, or one played again from its start, begins a fresh tape
const isFresh = (recorder, match) =>
  !recorder.cast ||
  match.tick < recorder.lastTick ||
  match.players.length !== recorder.cast.players.length;

function startTape(recorder, match) {
  clearRecorder(recorder);
  recorder.cast = castOf(match);
}

// once a tick, before the events are drained; while a duel's cut-in plays the pitch stands still,
// so its frames are not kept, only what happened, which rides on the next frame that is
export function recordFrame(recorder, match) {
  if (isFresh(recorder, match)) {
    startTape(recorder, match);
  }

  if (match.phase === 'duel') {
    recorder.held.push(...(match.events ?? []).map((event) => plainCopy(event)));
    recorder.lastTick = match.tick;

    return false;
  }

  const again = match.tick === recorder.lastTick && recorder.count > 0 && !recorder.held.length;
  const at = again ? (recorder.next - 1 + recorder.size) % recorder.size : recorder.next;

  recorder.slots[at] ??= createSnapshot();
  writeSnapshot(recorder.slots[at], match, [...recorder.held, ...(match.events ?? [])]);
  recorder.held = [];
  recorder.lastTick = match.tick;

  if (!again) {
    recorder.next = (at + 1) % recorder.size;
    recorder.count = Math.min(recorder.size, recorder.count + 1);
  }

  return true;
}

// the tape from its oldest frame to its newest, copied, so recording on never changes it
export function recordedFrames(recorder) {
  const first = (recorder.next - recorder.count + recorder.size) % recorder.size;

  return Array.from({ length: recorder.count }, (_, i) =>
    cloneSnapshot(recorder.slots[(first + i) % recorder.size]),
  );
}
