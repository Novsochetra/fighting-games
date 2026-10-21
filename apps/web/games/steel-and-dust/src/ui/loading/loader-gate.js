import { clamp } from '../../lib/math.js';

// a road that is already in never flashes the loading screen: it comes up only once the scene has
// waited a moment, then stays long enough not to flicker, and shows its full bar a beat before fading
export const LOADER_TIMING = { graceMs: 200, minShownMs: 600, lingerMs: 250 };

// the page opens with the loading screen up while the menu art comes in
export function createLoaderGate(now) {
  return {
    shown: true,
    shownAt: now,
    waitingSince: now,
    settledAt: null,
    baseline: 0,
    progress: 0,
  };
}

// each wait fills the bar from empty, however much of the scene was in when it began
export function relativeProgress(progress, baseline) {
  return baseline >= 1 ? 0 : clamp((progress - baseline) / (1 - baseline), 0, 1);
}

function keepWaiting(gate, progress, now, timing) {
  if (gate.waitingSince === null) {
    Object.assign(gate, { waitingSince: now, baseline: progress });
  }
  gate.settledAt = null;
  gate.progress = relativeProgress(progress, gate.baseline);
  if (!gate.shown && now - gate.waitingSince >= timing.graceMs) {
    Object.assign(gate, { shown: true, shownAt: now });
  }
}

function stopWaiting(gate, now, timing) {
  Object.assign(gate, { waitingSince: null, progress: 1 });
  if (!gate.shown) {
    return;
  }
  gate.settledAt ??= now;
  if (now - gate.shownAt >= timing.minShownMs && now - gate.settledAt >= timing.lingerMs) {
    gate.shown = false;
  }
}

// pending: waiting, but not up yet; complete: everything is in and the full bar holds a beat
export function loaderPhase(gate) {
  if (gate.waitingSince !== null) {
    return gate.shown ? 'loading' : 'pending';
  }
  return gate.shown ? 'complete' : 'hidden';
}

export function stepLoaderGate(gate, { waiting, progress, now }, timing = LOADER_TIMING) {
  if (waiting) {
    keepWaiting(gate, progress, now, timing);
  } else {
    stopWaiting(gate, now, timing);
  }
  return loaderPhase(gate);
}

// the bar reads 100% only once everything is in
export function loaderPercent(gate) {
  return gate.waitingSince === null ? 100 : Math.min(99, Math.floor(gate.progress * 100));
}
