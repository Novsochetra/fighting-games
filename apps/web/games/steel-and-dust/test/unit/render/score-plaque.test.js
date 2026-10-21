import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../src/config.js';
import { scorePlaque } from '../../../src/render/hud/score.js';

const line = (text) => ({ text, color: 'x' });

describe('the plaque behind the score', () => {
  it('fits its widest line and sits flush with the top right corner', () => {
    const plaque = scorePlaque([line('SCORE 0000000'), line('TIME 0:02')]);
    expect(plaque.x + plaque.width).toBe(VIEW_WIDTH);
    expect(plaque.y).toBe(0);
    expect(plaque.width).toBe(51 + 16);
  });

  it('grows a line taller once there is a best combo to show', () => {
    const two = scorePlaque([line('SCORE 0000000'), line('TIME 0:02')]);
    const three = scorePlaque([line('SCORE 0000000'), line('TIME 0:02'), line('BEST 38 HITS')]);
    expect(three.height - two.height).toBe(8);
  });
});
