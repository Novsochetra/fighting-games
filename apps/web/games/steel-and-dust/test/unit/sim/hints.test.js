import { describe, expect, it, vi } from 'vitest';
import { showHint } from '../../../src/sim/hints.js';

const gameWith = (hint = null) => ({ hint, hintsSeen: {}, io: { saveHints: vi.fn() } });

describe('first-time tips', () => {
  it('show a tip once and remember it', () => {
    const game = gameWith();
    showHint(game, 'crate');
    expect(game.hint).toMatchObject({ id: 'crate', time: 0 });
    expect(game.io.saveHints).toHaveBeenCalledWith({ crate: 1 });
    game.hint = null;
    showHint(game, 'crate');
    expect(game.hint).toBeNull();
  });

  it('let the current tip finish first', () => {
    const game = gameWith({ id: 'move', time: 20 });
    showHint(game, 'dash');
    expect(game.hint.id).toBe('move');
    game.hint.time = 200;
    showHint(game, 'dash');
    expect(game.hint.id).toBe('dash');
  });
});
