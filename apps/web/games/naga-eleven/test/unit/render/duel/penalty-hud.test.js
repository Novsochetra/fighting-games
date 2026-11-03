import { describe, expect, it } from 'vitest';
import { BAR, toCanvas, UNIT } from '../../../../src/render/duel/layout.js';
import { drawScoreboard } from '../../../../src/render/duel/penalty-hud.js';
import { PEN_GOAL } from '../../../../src/render/duel/penalty-layout.js';
import { createPen } from '../../../../src/render/duel/pen.js';
import { createRecordingContext } from '../../../support/recording-context.js';

const KICKS = [
  { team: 0, result: 'scored' },
  { team: 1, result: 'saved' },
  { team: 0, result: 'missed' },
];

function drawnBoxes() {
  const { context, calls } = createRecordingContext();

  context.measureText = (text) => ({ width: [...text].length * 8 });
  drawScoreboard(createPen(context, { unit: UNIT }), {
    shootout: { kicks: KICKS, humanTeam: 0 },
    names: ['CAM', 'JPN'],
  });

  return calls.filter((call) => call.name === 'fillRect').map((call) => call.args);
}

describe('the shootout scoreboard', () => {
  it("stays above the crossbar, where it once hid the keeper's head and the bar", () => {
    const boxes = drawnBoxes();

    expect(boxes.length).toBeGreaterThan(10);

    for (const [, top, , height] of boxes) {
      expect(top).toBeGreaterThanOrEqual(toCanvas(BAR));
      expect(top + height).toBeLessThanOrEqual(toCanvas(PEN_GOAL.bar));
    }
  });

  it("keeps inside the goal's width, centred on it", () => {
    const boxes = drawnBoxes();
    const left = Math.min(...boxes.map(([x]) => x));
    const right = Math.max(...boxes.map(([x, , width]) => x + width));

    expect(left).toBeGreaterThanOrEqual(toCanvas(PEN_GOAL.left));
    expect(right).toBeLessThanOrEqual(toCanvas(PEN_GOAL.right));
    expect(left + right).toBe(toCanvas(PEN_GOAL.left + PEN_GOAL.right));
  });
});
