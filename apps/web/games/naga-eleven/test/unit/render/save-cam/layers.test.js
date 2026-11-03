import { describe, expect, it } from 'vitest';

import { DIVE_BEATS } from '../../../../src/render/save-cam/dive-frames.js';
import { layersOf } from '../../../../src/render/save-cam/layers.js';
import { DEPTH } from '../../../../src/render/save-cam/view.js';

const flying = { x: 150, y: 60, radius: 5, z: 8 };

const sceneOf = ({ since, ball = flying, pose = {} }) => ({
  since,
  ball,
  pose: { animation: 'front-dive', holdsBall: false, ...pose },
});

describe('what the save cam draws behind the keeper and what before him', () => {
  it('draws the shot before him while he waits set', () => {
    expect(layersOf(sceneOf({ since: DIVE_BEATS.push - 1 }))).toEqual({
      trail: 'front',
      ball: 'front',
    });
  });

  it('puts the move’s beast behind him from his push-off on, the ball still before him', () => {
    for (const since of [DIVE_BEATS.push, DIVE_BEATS.stretch, 0, DIVE_BEATS.hold]) {
      expect(layersOf(sceneOf({ since }))).toEqual({ trail: 'behind', ball: 'front' });
    }
  });

  it('puts the ball behind him once it is past him or in his arms', () => {
    const past = { ...flying, z: DEPTH.keeper + 1 };

    expect(layersOf(sceneOf({ since: 6, ball: past }))).toEqual({
      trail: 'behind',
      ball: 'behind',
    });
    expect(layersOf(sceneOf({ since: 2, pose: { holdsBall: true } })).ball).toBe('behind');
  });

  it('leaves a ball he holds to his chest standing to his own drawing', () => {
    const held = { ...flying, held: true };

    expect(layersOf(sceneOf({ since: 4, ball: held, pose: { animation: 'idle' } })).ball).toBe(
      'none',
    );
  });
});
