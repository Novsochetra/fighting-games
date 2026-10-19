import { describe, expect, it } from 'vitest';
import { songFor } from '../../../src/audio/music/song-for.js';

const gameIn = (fields) => ({ mode: 'play', clearTime: 0, boss: null, ...fields });

describe('songFor', () => {
  it('plays the title song on the title screen', () => {
    expect(songFor(gameIn({ mode: 'title' }))).toBe('title');
  });

  it('plays the battle song while a run is on, paused or over', () => {
    for (const mode of ['play', 'pause', 'over']) {
      expect(songFor(gameIn({ mode }))).toBe('battle');
    }
  });

  it('switches to the boss song once the boss has entered and until it falls', () => {
    expect(songFor(gameIn({ boss: { entering: false, state: 'idle' } }))).toBe('boss');
    expect(songFor(gameIn({ boss: { entering: true, state: 'walk' } }))).toBe('battle');
    expect(songFor(gameIn({ boss: { entering: false, state: 'ko' } }))).toBe('battle');
  });

  it('goes silent once the stage is cleared, and in other modes', () => {
    expect(songFor(gameIn({ clearTime: 12 }))).toBeNull();
    expect(songFor(gameIn({ mode: 'clear' }))).toBeNull();
  });
});
