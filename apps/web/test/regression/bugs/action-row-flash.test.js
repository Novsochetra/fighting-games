// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  bootWithRealCatalog,
  byId,
  click,
  loadHomeMarkup,
  press,
  stopHomes,
} from '../../support/home-harness.js';

// Bug: swiping between cards made the buttons under the title flash. Play, Details and the heart
// swapped in one frame (Play jumped across the row, the others blinked out), and every swipe back to
// a favorite replayed the heart's pop. The heart now pops only when tapped, and the buttons fade
// through the change (action-swap.js; its timing is covered by unit/home/action-swap.test.js).
const heart = () => document.querySelector('#favorite .favorite__heart');

beforeEach(async () => {
  document.body.innerHTML = '';
  await loadHomeMarkup();
  const root = document.documentElement.style;
  root.setProperty('--duration-ring', '450ms');
  root.setProperty('--scale-heart-pop', '1.28');
});

afterEach(() => {
  stopHomes();
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('style');
});

describe('the heart under the title', () => {
  it('pops when tapped, and not when a swipe brings its game back', async () => {
    await bootWithRealCatalog();
    const pop = vi.spyOn(heart(), 'animate');
    click(byId('favorite'));
    expect(pop).toHaveBeenCalledTimes(1);
    press('ArrowRight');
    press('ArrowLeft');
    expect(byId('favorite').getAttribute('aria-pressed')).toBe('true');
    expect(pop).toHaveBeenCalledTimes(1);
  });

  it('does not pop when a tap takes the favorite away', async () => {
    await bootWithRealCatalog();
    click(byId('favorite'));
    const pop = vi.spyOn(heart(), 'animate');
    click(byId('favorite'));
    expect(pop).not.toHaveBeenCalled();
  });
});
