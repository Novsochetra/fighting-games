import { describe, expect, it, vi } from 'vitest';
import {
  delay,
  loadImage,
  progressFraction,
  settleWithin,
  trackProgress,
} from '../../../src/ui/loading/preload.js';

// an image that loads or fails only when the test says so, with or without decode()
function createFakeImage({ decode } = {}) {
  const image = { src: '', onload: null, onerror: null };
  if (decode) {
    image.decode = decode;
  }
  return image;
}

function manualTimers() {
  const pending = [];
  return {
    setTimer: (resolve, ms) => pending.push({ resolve, ms }),
    fire: () => pending.splice(0).forEach(({ resolve }) => resolve()),
    delays: () => pending.map(({ ms }) => ms),
  };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('loading an image', () => {
  it('sets the source and settles with the image once it loads', async () => {
    const image = createFakeImage();
    const loading = loadImage('assets/ui/kit/panel.png', () => image);
    expect(image.src).toBe('assets/ui/kit/panel.png');
    image.onload();
    await expect(loading).resolves.toBe(image);
  });

  it('settles when the file fails, so a broken image never hangs the loading screen', async () => {
    const image = createFakeImage();
    const loading = loadImage('missing.png', () => image);
    image.onerror();
    await expect(loading).resolves.toBe(image);
  });

  it('waits for decode() where the browser has it', async () => {
    let decoded;
    const image = createFakeImage({ decode: () => new Promise((resolve) => (decoded = resolve)) });
    const settled = vi.fn();
    loadImage('a.png', () => image).then(settled);
    await flush();
    expect(settled).not.toHaveBeenCalled();
    decoded();
    await flush();
    expect(settled).toHaveBeenCalledWith(image);
  });

  it('falls back to the load events when decode() is rejected for a file still loading', async () => {
    const image = createFakeImage({ decode: () => Promise.reject(new Error('EncodingError')) });
    const settled = vi.fn();
    loadImage('a.png', () => image).then(settled);
    await flush();
    expect(settled).not.toHaveBeenCalled();
    image.onload();
    await flush();
    expect(settled).toHaveBeenCalledWith(image);
  });
});

describe('progress', () => {
  it('is the share settled, and full when there is nothing to wait for', () => {
    expect(progressFraction(0, 4)).toBe(0);
    expect(progressFraction(3, 4)).toBe(0.75);
    expect(progressFraction(5, 4)).toBe(1);
    expect(progressFraction(0, 0)).toBe(1);
  });

  it('reports each settle in turn, counting failures as settled', async () => {
    const reports = [];
    const steps = [0, 1, 2].map(() => Promise.withResolvers());
    const all = trackProgress(
      steps.map(({ promise }) => promise),
      (fraction) => reports.push(fraction),
    );
    expect(reports).toEqual([0]);
    steps[2].reject(new Error('404'));
    await flush();
    steps[0].resolve();
    steps[1].resolve();
    await all;
    expect(reports).toEqual([0, 1 / 3, 2 / 3, 1]);
  });
});

describe('time limits', () => {
  it('waits on the timer it is given', async () => {
    const timers = manualTimers();
    const done = vi.fn();
    delay(250, timers.setTimer).then(done);
    expect(timers.delays()).toEqual([250]);
    await flush();
    expect(done).not.toHaveBeenCalled();
    timers.fire();
    await flush();
    expect(done).toHaveBeenCalled();
  });

  it('resolves true when the wait settles in time, failures included', async () => {
    const timers = manualTimers();
    await expect(settleWithin(Promise.resolve('in'), 1000, timers.setTimer)).resolves.toBe(true);
    await expect(settleWithin(Promise.reject(new Error()), 1000, timers.setTimer)).resolves.toBe(
      true,
    );
  });

  it('gives up on a stalled wait when the time runs out', async () => {
    const timers = manualTimers();
    const stalled = new Promise(() => {});
    const result = settleWithin(stalled, 15000, timers.setTimer);
    expect(timers.delays()).toEqual([15000]);
    timers.fire();
    await expect(result).resolves.toBe(false);
  });
});
