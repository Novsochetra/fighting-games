import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../src/config.js';
import { clockPlaque, formatClock, waveText } from '../../../src/render/hud/clock.js';
import { currentZone } from '../../../src/sim/stage/mission.js';
import { createPlayingGame } from '../../support/test-game.js';

describe('the clock on the HUD', () => {
  it('reads minutes and seconds with no label', () => {
    expect(formatClock(65 * 60)).toBe('1:05');
    expect(formatClock(754 * 60)).toBe('12:34');
  });

  it('sits in the middle of the screen and keeps its size as the minutes pass', () => {
    const early = clockPlaque('0:05');
    const late = clockPlaque('99:59');
    expect(early.x + early.width / 2).toBe(VIEW_WIDTH / 2);
    expect(late).toEqual(early);
  });
});

describe('the wave under the clock', () => {
  it('counts the waves of a zone the camera is locked on', () => {
    const game = createPlayingGame();
    game.arena = { left: 0, right: VIEW_WIDTH };
    game.stage.zoneIndex = 0;
    game.stage.waveIndex = 1;
    expect(waveText(game)).toBe(`WAVE 2/${currentZone(game).waves.length}`);
  });

  it('shows nothing on the open road', () => {
    const game = createPlayingGame();
    game.arena = null;
    expect(waveText(game)).toBe(null);
  });
});
