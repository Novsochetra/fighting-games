import { describe, expect, it } from 'vitest';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../../../src/config.js';
import { WIPE_TICKS } from '../../../src/data/mission-handoff.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import {
  missionWipe,
  mosaicBlock,
  WIPE_CELL,
  wipeCells,
  wipeCover,
} from '../../../src/render/overlays/wipe-timing.js';
import { CLEAR_TICKS, REVEAL_FRAMES } from '../../../src/sim/stage/stage-clear.js';

const CELLS = (VIEW_WIDTH / WIPE_CELL) * (VIEW_HEIGHT / WIPE_CELL);
const clearAt = (clearTime, missionIndex = 0) =>
  missionWipe({ clearTime, missionIndex, fadeIn: 0 });
const openAt = (fadeIn) => missionWipe({ clearTime: 0, missionIndex: 1, fadeIn });
const radiusAt = (cells, x, y) => cells.find((cell) => cell.x === x && cell.y === y)?.radius ?? 0;

describe('the wipe between two missions', () => {
  it('leaves the road clear while it is fought and through most of the clear', () => {
    expect(clearAt(0)).toBeNull();
    expect(clearAt(1)).toBeNull();
    expect(clearAt(CLEAR_TICKS - WIPE_TICKS)).toBeNull();
  });

  it('closes tick by tick over the cleared road, shut as the next mission starts', () => {
    const closes = [WIPE_TICKS - 1, WIPE_TICKS / 2, 0].map((left) => clearAt(CLEAR_TICKS - left));
    expect(closes.every((wipe) => wipe.closing)).toBe(true);
    expect(closes.map(wipeCover)).toEqual([1 / WIPE_TICKS, 0.5, 1]);
    expect(wipeCells(closes.at(-1))).toHaveLength(CELLS);
    expect(wipeCells(closes.at(-1)).every((cell) => cell.radius === WIPE_CELL)).toBe(true);
  });

  it('keeps the last mission lit behind the All clear screen', () => {
    expect(clearAt(CLEAR_TICKS, MISSIONS.length - 1)).toBeNull();
    expect(clearAt(CLEAR_TICKS, MISSIONS.length - 2)).not.toBeNull();
  });

  it('opens the next mission from shut to clear over its drawn frames', () => {
    expect(wipeCover(openAt(REVEAL_FRAMES))).toBe(1);
    expect(wipeCells(openAt(REVEAL_FRAMES))).toHaveLength(CELLS);
    expect(wipeCells(openAt(1))).toEqual([]);
    expect(openAt(0)).toBeNull();
  });

  it('runs its wave from the top left to the bottom right, out of a road and into the next', () => {
    const corner = { x: WIPE_CELL / 2, y: WIPE_CELL / 2 };
    const far = { x: VIEW_WIDTH - WIPE_CELL / 2, y: VIEW_HEIGHT - WIPE_CELL / 2 };
    const closing = wipeCells(clearAt(CLEAR_TICKS - WIPE_TICKS / 2));
    expect(radiusAt(closing, corner.x, corner.y)).toBe(WIPE_CELL);
    expect(radiusAt(closing, far.x, far.y)).toBe(0);
    const opening = wipeCells(openAt(REVEAL_FRAMES / 2));
    expect(radiusAt(opening, corner.x, corner.y)).toBe(0);
    expect(radiusAt(opening, far.x, far.y)).toBe(WIPE_CELL);
  });

  it('grows the mosaic as the wipe closes and shrinks it as the next one opens', () => {
    const closing = Array.from({ length: WIPE_TICKS }, (_, i) =>
      mosaicBlock(clearAt(CLEAR_TICKS - i)),
    );
    expect(closing.at(-1)).toBe(1);
    expect(closing[0]).toBe(12);
    expect(closing).toEqual(closing.toSorted((first, second) => second - first));
    expect(mosaicBlock(openAt(REVEAL_FRAMES))).toBe(12);
    expect(mosaicBlock(openAt(1))).toBe(1);
  });

  it('only grows blocks that tile the view exactly', () => {
    const closing = Array.from({ length: WIPE_TICKS }, (_, i) => clearAt(CLEAR_TICKS - i));
    const opening = Array.from({ length: REVEAL_FRAMES }, (_, i) => openAt(i + 1));
    for (const block of new Set([...closing, ...opening].map(mosaicBlock))) {
      expect(VIEW_WIDTH % block).toBe(0);
      expect(VIEW_HEIGHT % block).toBe(0);
    }
  });
});
