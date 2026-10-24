import { describe, expect, it } from 'vitest';
import { RENDER_SCALE } from '../../../src/config.js';
import { SUMMARY } from '../../../src/data/mission-summary.js';
import { createView } from '../../../src/render/create-view.js';
import { drawMissionSummary } from '../../../src/render/hud/mission-summary.js';
import { CLEAR_TICKS } from '../../../src/sim/stage/stage-clear.js';
import { FakeImage } from '../../support/fake-image.js';
import { createGridContext } from '../../support/grid-canvas.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';

function gridView() {
  const { context, misses, counts } = createGridContext();
  context.canvas = { width: 768, height: 432 };
  const view = createView({
    context,
    createCanvas: (width, height) => Object.assign(new RecordingCanvas(), { width, height }),
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  context.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
  return { view, painter: view.painter, misses, counts };
}

const clearAt = (clearTime) => ({ clearTime, missionLoot: { coin: 22, gem: 5, apple: 1 } });

// the strings the pixel font has stamped so far, by their stamp keys
function stampedTexts(painter) {
  return [...painter.stamps.cache.keys()]
    .filter((key) => key.startsWith('text|'))
    .map((key) => key.split('|').at(-1));
}

describe('the loot summary on screen', () => {
  it('draws nothing in play, or over the clear before the card is down', () => {
    const { view, painter, counts } = gridView();
    for (const clearTime of [0, 1, SUMMARY.openAt - 1]) {
      drawMissionSummary(painter, clearAt(clearTime), view);
    }
    expect(counts.draws).toBe(0);
  });

  it('lands the glass, its rim and every count on whole screen pixels as it plays', () => {
    const { view, painter, misses, counts } = gridView();
    for (let clearTime = SUMMARY.openAt; clearTime <= CLEAR_TICKS; clearTime++) {
      drawMissionSummary(painter, clearAt(clearTime), view);
    }
    expect(misses).toEqual([]);
    expect(counts.draws).toBeGreaterThan(5000);
  });

  it('ends on the count of every kind taken and the take in coins', () => {
    const { view, painter } = gridView();
    drawMissionSummary(painter, clearAt(CLEAR_TICKS), view);
    expect(stampedTexts(painter)).toEqual(expect.arrayContaining(['LOOT', '22', '5', '1', '+72']));
  });

  it('rolls a count up through smaller numbers on its way', () => {
    const { view, painter } = gridView();
    for (let clearTime = SUMMARY.openAt; clearTime <= CLEAR_TICKS; clearTime++) {
      drawMissionSummary(painter, clearAt(clearTime), view);
    }
    const takes = stampedTexts(painter).filter((text) => text.startsWith('+'));
    expect(takes.length).toBeGreaterThan(SUMMARY.maxSteps - 1);
  });
});
