// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  needsTurnCard,
  pauseUnderCard,
  showTurnCard,
  TURN_BELOW_WIDTH,
  TURN_WORDS,
} from '../../../src/ui/turn-card.js';

const root = () => document.documentElement;

beforeEach(() => {
  document.body.innerHTML = '';
  root().className = '';
});

describe('when the turn card is wanted', () => {
  it('is wanted by a phone held upright that plays by touch', () => {
    expect(needsTurnCard({ width: 375, height: 812, touchOn: true })).toBe(true);
    expect(needsTurnCard({ width: 320, height: 568, touchOn: true })).toBe(true);
    expect(needsTurnCard({ width: 440, height: 956, touchOn: true })).toBe(true);
  });

  it('is not wanted held sideways, nor upright without touch, nor by a tablet upright', () => {
    expect(needsTurnCard({ width: 812, height: 375, touchOn: true })).toBe(false);
    expect(needsTurnCard({ width: 375, height: 812, touchOn: false })).toBe(false);
    expect(needsTurnCard({ width: 768, height: 1024, touchOn: true })).toBe(false);
    expect(needsTurnCard({ width: TURN_BELOW_WIDTH, height: 1000, touchOn: true })).toBe(false);
  });

  it('is not wanted by a screen near square, which isPortrait does not call upright', () => {
    expect(needsTurnCard({ width: 500, height: 520, touchOn: true })).toBe(false);
  });
});

describe('the turn card', () => {
  it('is made the first time it shows, once, with its words in English and Khmer', () => {
    showTurnCard(document, false);

    expect(document.getElementById('turn-card')).toBeNull();

    showTurnCard(document, true);
    showTurnCard(document, false);
    showTurnCard(document, true);

    const cards = document.querySelectorAll('.turn-card');
    const words = [...cards[0].querySelectorAll('[lang]')].map((node) => [
      node.lang,
      node.textContent,
    ]);

    expect(cards).toHaveLength(1);
    expect(words).toEqual([
      ['en', TURN_WORDS.en],
      ['km', TURN_WORDS.km],
    ]);
  });

  it('marks the page upright while it shows, for the styles to show it', () => {
    showTurnCard(document, true);

    expect(root().classList.contains('is-upright')).toBe(true);

    showTurnCard(document, false);

    expect(root().classList.contains('is-upright')).toBe(false);
  });

  it('stands in the game’s panel, its phone hidden from a screen reader', () => {
    showTurnCard(document, true);

    const card = document.getElementById('turn-card');

    expect(card.getAttribute('role')).toBe('alert');
    expect(card.querySelector('.panel .panel-trim')).not.toBeNull();
    expect(card.querySelector('canvas.turn-phone').getAttribute('aria-hidden')).toBe('true');
  });
});

describe('play under the turn card', () => {
  it('pauses while the card shows and the match plays', () => {
    const pause = vi.fn();

    root().classList.add('is-upright', 'is-playing');
    pauseUnderCard(root(), pause);

    expect(pause).toHaveBeenCalledOnce();
  });

  it('leaves alone a match held sideways, and a menu or a pause under the card', () => {
    const pause = vi.fn();

    root().classList.add('is-playing');
    pauseUnderCard(root(), pause);
    root().className = 'is-upright';
    pauseUnderCard(root(), pause);

    expect(pause).not.toHaveBeenCalled();
  });
});
