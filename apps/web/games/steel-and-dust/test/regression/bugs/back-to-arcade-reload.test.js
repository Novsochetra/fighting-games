// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { openPage } from '../../support/menu-page.js';

// Back to arcade loaded the arcade as a new page: it started over, fading every part in again behind
// a loading notice, and the tab's history grew a step. The arcade that opened the game is one step
// back, and going there lets the browser restore it as it was left, its card shrinking back in.
describe('Back to arcade', () => {
  afterEach(() => vi.restoreAllMocks());

  function leaveFrom(referrer) {
    window.happyDOM.setURL('https://arcade.example/games/steel-and-dust/');
    vi.spyOn(document, 'referrer', 'get').mockReturnValue(referrer);
    vi.spyOn(window.history, 'length', 'get').mockReturnValue(2);
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    const assign = vi.spyOn(window.location, 'assign').mockImplementation(() => {});
    openPage().act('arcade');
    return { back, assign };
  }

  it('steps back to the arcade the game was opened from', () => {
    const { back, assign } = leaveFrom('https://arcade.example/');
    expect(back).toHaveBeenCalledTimes(1);
    expect(assign).not.toHaveBeenCalled();
  });

  it('still loads the arcade when the game was opened some other way', () => {
    const { back, assign } = leaveFrom('');
    expect(assign).toHaveBeenCalledWith('../../');
    expect(back).not.toHaveBeenCalled();
  });
});
