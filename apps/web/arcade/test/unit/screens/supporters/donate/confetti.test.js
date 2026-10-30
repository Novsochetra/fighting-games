import { describe, expect, it, vi } from 'vitest';
import {
  CONFETTI,
  launchPieces,
  opacityAt,
  stepPieces,
} from '@/screens/supporters/donate/confetti.js';
import { playConfetti } from '@/screens/supporters/donate/confetti-view.js';

const COLORS = ['pink', 'gold'];
const heart = { getBoundingClientRect: () => ({ left: 140, top: 40, width: 20, height: 20 }) };
const steady = (value) => () => value;

describe('confetti pieces', () => {
  it('start at the burst point and fly upward, in the given colors', () => {
    const pieces = launchPieces({ origin: { x: 100, y: 80 }, colors: COLORS, count: 20 });
    expect(pieces).toHaveLength(20);
    for (const piece of pieces) {
      expect([piece.x, piece.y]).toEqual([100, 80]);
      expect(piece.vy).toBeLessThan(0);
      expect(COLORS).toContain(piece.color);
    }
  });

  it('slow down in the air and fall under gravity', () => {
    const [piece] = launchPieces({
      origin: { x: 0, y: 0 },
      colors: COLORS,
      count: 1,
      random: steady(0.5),
    });
    expect(piece.vx).toBeCloseTo(0);
    expect(piece.vy).toBeCloseTo(-(CONFETTI.minSpeed + CONFETTI.extraSpeed / 2));
    for (let i = 0; i < 120; i += 1) {
      stepPieces([piece], 1 / 60);
    }
    expect(piece.vy).toBeGreaterThan(0);
    expect(piece.y).toBeGreaterThan(-400);
  });

  it('stay fully there, then fade out over the last quarter', () => {
    expect(opacityAt(0, 1000)).toBe(1);
    expect(opacityAt(750, 1000)).toBe(1);
    expect(opacityAt(875, 1000)).toBeCloseTo(0.5);
    expect(opacityAt(1200, 1000)).toBe(0);
  });
});

function fakePage({ reducedMotion = false, duration = '1000ms' } = {}) {
  const frames = [];
  const calls = { fillRect: 0, clearRect: 0 };
  const context = {
    setTransform() {},
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    scale() {},
    fillRect: () => (calls.fillRect += 1),
    clearRect: () => (calls.clearRect += 1),
  };
  const canvas = {
    getContext: () => context,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 300, height: 200 }),
  };
  const style = { getPropertyValue: (name) => (name.startsWith('--color-') ? 'pink' : duration) };
  const window = {
    devicePixelRatio: 2,
    getComputedStyle: () => style,
    matchMedia: () => ({ matches: reducedMotion }),
    requestAnimationFrame: (draw) => frames.push(draw),
    cancelAnimationFrame: vi.fn(),
  };
  const document = { defaultView: window, documentElement: {} };
  const runFrame = (time) => frames.shift()?.(time);
  return { document, canvas, frames, calls, window, runFrame };
}

describe('playConfetti', () => {
  it('draws every piece each frame until the burst is over, then clears', () => {
    const page = fakePage();
    playConfetti({ document: page.document, canvas: page.canvas, from: heart });
    expect(page.canvas.width).toBe(600);
    page.runFrame(0);
    expect(page.calls.fillRect).toBe(CONFETTI.count);
    page.runFrame(500);
    expect(page.frames).toHaveLength(1);
    page.runFrame(1001);
    expect(page.frames).toHaveLength(0);
    expect(page.calls.clearRect).toBeGreaterThan(3);
  });

  it('stays still for a visitor who asks for less motion', () => {
    const page = fakePage({ reducedMotion: true });
    playConfetti({ document: page.document, canvas: page.canvas, from: heart });
    expect(page.frames).toHaveLength(0);
  });

  it('stops and clears when asked', () => {
    const page = fakePage();
    const stop = playConfetti({
      document: page.document,
      canvas: page.canvas,
      from: heart,
    });
    stop();
    expect(page.window.cancelAnimationFrame).toHaveBeenCalled();
    expect(page.calls.clearRect).toBe(1);
  });
});
