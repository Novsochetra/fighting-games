import { describe, expect, it } from 'vitest';
import { hitTest } from '../../../../src/render/dialogue/index.js';
import { SKIP_TAG, overlayLayout, skipTagRect } from '../../../../src/render/dialogue/layout.js';
import { askSkip, createScene, endScene } from '../../../../src/story/index.js';
import { LEGEND_SCENE, SHORT_SCENE, idle } from '../../../support/story-fixtures.js';

const middleOf = (rect) => ({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });

describe('a tap on a scene', () => {
  it('goes on anywhere on a full-screen scene', () => {
    const state = createScene(SHORT_SCENE);

    expect(hitTest(state, { x: 10, y: 10 })).toBe('confirm');
    expect(hitTest(state, { x: 400, y: 350 })).toBe('confirm');
  });

  it('skips the scene on the skip tag', () => {
    expect(hitTest(createScene(SHORT_SCENE), middleOf(SKIP_TAG))).toBe('skip');
  });

  it('takes the whole of the wider tag that asks to skip', () => {
    const state = createScene(SHORT_SCENE);
    const asking = skipTagRect(true);
    const leftEnd = { x: asking.x + 4, y: asking.y + 4 };

    expect(asking.width).toBeGreaterThan(SKIP_TAG.width);
    expect(hitTest(state, leftEnd)).toBe('confirm');

    askSkip(state);
    expect(hitTest(state, leftEnd)).toBe('skip');
  });

  it('goes on over a match only on the box', () => {
    const state = createScene(SHORT_SCENE);
    const { box } = overlayLayout('left');

    idle(state, 20);

    expect(hitTest(state, middleOf(box), { overlay: true })).toBe('confirm');
    expect(hitTest(state, { x: 400, y: 100 }, { overlay: true })).toBeNull();
    expect(hitTest(state, middleOf(SKIP_TAG), { overlay: true })).toBeNull();
  });

  it('goes on over a match on narration’s band', () => {
    const state = createScene(LEGEND_SCENE);

    idle(state, 20);

    expect(hitTest(state, { x: 384, y: 390 }, { overlay: true })).toBe('confirm');
    expect(hitTest(state, { x: 384, y: 200 }, { overlay: true })).toBeNull();
  });

  it('does nothing once the scene is over', () => {
    expect(hitTest(endScene(createScene(SHORT_SCENE)), { x: 10, y: 10 })).toBeNull();
  });
});
