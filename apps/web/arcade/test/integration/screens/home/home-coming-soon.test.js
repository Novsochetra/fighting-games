// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CUES } from '@/services/sound/sound-cues.js';
import { createFakeAudioContext } from '../../../support/fake-audio.js';
import {
  bootWithSteelAndDust,
  byId,
  cards,
  centerCard,
  click,
  press,
  spotlightTitle,
  stopHomes,
  tiles,
  onPage,
} from '../../../support/home-harness.js';

const teasers = () => cards().filter((card) => card.querySelector('.art--soon'));

beforeEach(async () => {
  document.body.innerHTML = '';
});

afterEach(stopHomes);

describe('the Coming Soon teasers', () => {
  it('follow the games in the carousel and stay out of the library', async () => {
    await bootWithSteelAndDust();
    expect(teasers()).toHaveLength(2);
    expect(cards().slice(-2)).toEqual(teasers());
    expect(teasers()[0].getAttribute('aria-label')).toBe('Coming Soon');
    expect(tiles()).toHaveLength(1);
    expect(byId('library-count').textContent).toBe('1 game');
  });

  it('turn Play into a quiet Coming Soon and hide Details and the heart', async () => {
    await bootWithSteelAndDust();
    press('ArrowRight');
    expect(spotlightTitle()).toBe('Coming Soon');
    expect(byId('spotlight-meta').textContent).toBe('New game · In development');
    expect(byId('play-label').textContent).toBe('Coming Soon');
    expect(byId('play').hasAttribute('href')).toBe(false);
    expect(byId('play').classList.contains('is-unavailable')).toBe(true);
    expect(byId('details-open').hidden).toBe(true);
    expect(byId('favorite').hidden).toBe(true);
    expect(byId('backdrops').querySelector('.backdrop.is-active').matches('.backdrop--soon')).toBe(
      true,
    );

    expect(byId('hero').dataset.backdrop).toBe('plain');

    press('ArrowLeft');
    expect(byId('hero').dataset.backdrop).toBe('art');
    expect(byId('play-label').textContent).toBe('Play');
    expect(byId('play').getAttribute('href')).toBe(onPage('games/steel-and-dust/'));
    expect(byId('details-open').hidden).toBe(false);
    expect(byId('favorite').hidden).toBe(false);
  });

  it('open nothing from Enter, Play or a click, and knock instead of chiming', async () => {
    const context = createFakeAudioContext();
    const { navigate } = await bootWithSteelAndDust({ createAudioContext: vi.fn(() => context) });
    press('ArrowRight');
    const afterMove = context.started.length;
    press('Enter');
    click(byId('play'));
    click(centerCard());
    expect(navigate).not.toHaveBeenCalled();
    expect(context.started).toHaveLength(afterMove + 3 * CUES.locked.length);
  });
});
