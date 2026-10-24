import { describe, expect, it, vi } from 'vitest';
import { createArcadeExit } from '../../../src/ui/menus/arcade-exit.js';

const GAME = 'https://arcade.example/games/steel-and-dust/';

function leave({ referrer, length = 2, href = GAME }) {
  const location = { href, assign: vi.fn() };
  const history = { length, back: vi.fn() };
  createArcadeExit({ location, history, referrer })();
  return { assign: location.assign, back: history.back };
}

describe('createArcadeExit', () => {
  it.each(['https://arcade.example/', 'https://arcade.example/index.html'])(
    'steps back to the arcade that opened the game from %s',
    (referrer) => {
      const { assign, back } = leave({ referrer });
      expect(back).toHaveBeenCalledTimes(1);
      expect(assign).not.toHaveBeenCalled();
    },
  );

  it('finds the arcade under a sub path, as on GitHub Pages', () => {
    const href = 'https://me.github.io/arcade/games/steel-and-dust/';
    expect(leave({ href, referrer: 'https://me.github.io/arcade/' }).back).toHaveBeenCalled();
    expect(leave({ href, referrer: 'https://me.github.io/' }).back).not.toHaveBeenCalled();
  });

  it.each([
    '',
    'not an address',
    'https://other.example/',
    'http://arcade.example/',
    'https://arcade.example/supporters/',
    'https://arcade.example/games/steel-and-dust/',
  ])('loads the arcade as a new page when the game came from %j', (referrer) => {
    const { assign, back } = leave({ referrer });
    expect(assign).toHaveBeenCalledWith('../../');
    expect(back).not.toHaveBeenCalled();
  });

  it('loads the arcade when the game is the first page of its tab', () => {
    const { assign, back } = leave({ referrer: 'https://arcade.example/', length: 1 });
    expect(assign).toHaveBeenCalledWith('../../');
    expect(back).not.toHaveBeenCalled();
  });
});
