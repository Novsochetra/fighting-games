import { describe, expect, it } from 'vitest';
import { drawSinking } from '../../../../src/render/fighters/sinking.js';

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

  it('is drawn lower by how far it has sunk, cut off at the sand under its feet', () => {
    const { painter, calls, draw } = recordingPainter();

    drawSinking(painter, { x: 100, y: 184, sunk: 12.4 }, draw);

    const names = calls.map(([name]) => name);
    const [, x, y, width, height] = calls.find(([name]) => name === 'rect');
    expect(names).toEqual(['save', 'beginPath', 'rect', 'clip', 'translate', 'draw', 'restore']);
    expect(calls.find(([name]) => name === 'translate')).toEqual(['translate', 0, 12]);
    expect(x).toBeLessThan(100);
    expect(x + width).toBeGreaterThan(100);
    expect(y + height).toBe(186);
  });
});
