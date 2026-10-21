import { describe, expect, it } from 'vitest';
import {
  createLoaderGate,
  LOADER_TIMING,
  loaderPercent,
  relativeProgress,
  stepLoaderGate,
} from '../../../src/ui/loading/loader-gate.js';

const { graceMs, minShownMs, lingerMs } = LOADER_TIMING;

// a gate that has finished the page's own wait and is down, as during play
function settledGate() {
  const gate = createLoaderGate(0);
  stepLoaderGate(gate, { waiting: false, progress: 1, now: 0 });
  stepLoaderGate(gate, { waiting: false, progress: 1, now: 10000 });
  return gate;
}

const step = (gate, now, waiting = true, progress = 0) =>
  stepLoaderGate(gate, { waiting, progress, now });

describe('the loading screen gate', () => {
  it('is up from the start, while the page loads its art', () => {
    const gate = createLoaderGate(0);
    expect(step(gate, 16, true, 0.4)).toBe('loading');
    expect(loaderPercent(gate)).toBe(40);
  });

  it('never reads 100% until everything is in', () => {
    const gate = createLoaderGate(0);
    step(gate, 16, true, 0.999);
    expect(loaderPercent(gate)).toBe(99);
    step(gate, 32, false, 1);
    expect(loaderPercent(gate)).toBe(100);
  });

  it('holds the full bar a beat, then comes down', () => {
    const gate = createLoaderGate(0);
    step(gate, 5000, true, 0.9);
    expect(step(gate, 5016, false)).toBe('complete');
    expect(step(gate, 5016 + lingerMs - 1, false)).toBe('complete');
    expect(step(gate, 5016 + lingerMs, false)).toBe('hidden');
  });

  it('does not come up for a road already in, or one that comes in within the grace', () => {
    const gate = settledGate();
    expect(step(gate, 20000)).toBe('pending');
    expect(step(gate, 20000 + graceMs - 1)).toBe('pending');
    expect(step(gate, 20000 + graceMs, false)).toBe('hidden');
  });

  it('comes up once a road has kept the game waiting past the grace', () => {
    const gate = settledGate();
    step(gate, 20000);
    expect(step(gate, 20000 + graceMs)).toBe('loading');
  });

  it('stays up long enough not to flicker when the road comes in just after it shows', () => {
    const gate = settledGate();
    step(gate, 20000);
    const shownAt = 20000 + graceMs;
    step(gate, shownAt);
    expect(step(gate, shownAt + 16, false)).toBe('complete');
    expect(step(gate, shownAt + minShownMs - 1, false)).toBe('complete');
    expect(step(gate, shownAt + minShownMs, false)).toBe('hidden');
  });

  it('fills each wait from empty, however much was in when it began', () => {
    const gate = settledGate();
    step(gate, 20000, true, 0.5);
    expect(loaderPercent(gate)).toBe(0);
    step(gate, 20300, true, 0.75);
    expect(loaderPercent(gate)).toBe(50);
  });

  it('measures a wait against what was in at its start', () => {
    expect(relativeProgress(0.5, 0)).toBe(0.5);
    expect(relativeProgress(0.75, 0.5)).toBe(0.5);
    expect(relativeProgress(0.2, 0.5)).toBe(0);
    expect(relativeProgress(1, 1)).toBe(0);
  });
});
