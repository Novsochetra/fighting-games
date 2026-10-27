import { describe, expect, it } from 'vitest';
import { songFor } from '../../../src/audio/music/song-for.js';

const gameIn = (fields) => ({ mode: 'play', lootTime: 0, clearTime: 0, boss: null, ...fields });

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

  it('goes silent from the mission boss falling, through the loot time and the clear', () => {
    expect(songFor(gameIn({ lootTime: 30, boss: { entering: false, state: 'ko' } }))).toBeNull();
    expect(songFor(gameIn({ clearTime: 12 }))).toBeNull();
  });

  it('plays the title song again as the credits roll once the last mission is clear', () => {
    expect(songFor(gameIn({ mode: 'clear', clearTime: 600 }))).toBe('title');
  });
});
