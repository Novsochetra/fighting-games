import { describe, expect, it } from 'vitest';
import { drawSinking, sinkingDrop } from '../../../../src/render/fighters/sinking.js';
import { PIT_MIDDLE } from '../../../../src/render/scene/quicksand.js';

function recordingPainter() {
  const calls = [];
  const record =
    (name) =>
    (...args) =>
      calls.push([name, ...args]);
  const context = {};
  for (const name of ['save', 'beginPath', 'rect', 'clip', 'translate', 'restore']) {
    context[name] = record(name);
  }

  return { painter: { context }, calls, draw: record('draw') };
}

describe('a body sinking in quicksand', () => {
  it('is drawn as it is when it has not sunk at all', () => {
    const { painter, calls, draw } = recordingPainter();

    drawSinking(painter, { x: 100, y: 184, sunk: 0 }, draw);

    expect(calls).toEqual([['draw']]);
  });

  it('is drawn down in the middle of the pit, lower by how far it has sunk, cut off by its sand', () => {
    const { painter, calls, draw } = recordingPainter();

    drawSinking(painter, { x: 100, y: 184, sunk: 12.4 }, draw);

    const names = calls.map(([name]) => name);
    const [, x, y, width, height] = calls.find(([name]) => name === 'rect');
    expect(names).toEqual(['save', 'beginPath', 'rect', 'clip', 'translate', 'draw', 'restore']);
    expect(calls.find(([name]) => name === 'translate')).toEqual(['translate', 0, PIT_MIDDLE + 12]);
    expect(x).toBeLessThan(100);
    expect(x + width).toBeGreaterThan(100);
    expect(y + height).toBe(184 + PIT_MIDDLE + 2);
  });

  it('steps down off the far rim into the middle of the pit as it starts to sink, not in a jump', () => {
    const drops = [0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.1].map((sunk) => sinkingDrop({ sunk }));

    expect(PIT_MIDDLE).toBeGreaterThan(4);
    expect(drops[0]).toBeLessThan(PIT_MIDDLE / 2);
    for (let i = 1; i < drops.length; i++) {
      expect(drops[i] - drops[i - 1]).toBeGreaterThanOrEqual(0);
      expect(drops[i] - drops[i - 1]).toBeLessThanOrEqual(2);
    }
    expect(sinkingDrop({ sunk: 3 })).toBe(PIT_MIDDLE + 3);
  });
});
