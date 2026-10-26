// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bootWithGames, byId, click, stopHomes } from '../../support/home-harness.js';

// Bug: the carousel did not look like it slid. With one game and two teasers, every step took the card
// on one edge round the loop: it blinked out there and faded in on the other edge while the other two
// slid. It now slides in from out of sight like the rest, and a copy of it slides out by the edge it
// left, as on the hero select screen.
const track = () => byId('carousel-track');
const leaving = () => [...track().querySelectorAll('.card.is-leaving')];
const cardAt = (index) => track().querySelector(`.card[data-game-index="${index}"]`);

function recordSlots(card) {
  const placed = [];
  const setProperty = card.style.setProperty.bind(card.style);
  vi.spyOn(card.style, 'setProperty').mockImplementation((name, value) => {
    placed.push([name, value]);
    setProperty(name, value);
  });
  return (name) => placed.filter(([property]) => property === name).map(([, value]) => value);
}

beforeEach(async () => {
  document.body.innerHTML = '';
  document.documentElement.style.setProperty('--duration-carousel', '550ms');
});

afterEach(() => {
  stopHomes();
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('style');
});

describe('a card that comes round the carousel loop', () => {
  it('slides in from out of sight on the side it comes in from', async () => {
    await bootWithGames(['alpha']);
    const card = cardAt(2);
    const placed = recordSlots(card);
    click(byId('next'));
    expect(placed('--side')).toEqual(['1', '1']);
    expect(placed('--distance')).toEqual(['2', '1']);
    expect(placed('--card-opacity')).toEqual(['0', '1']);
    expect(card.style.transition).toBe('');
  });

  it('leaves a copy that slides out by the edge it left, then goes', async () => {
    await bootWithGames(['alpha']);
    vi.useFakeTimers();
    click(byId('next'));
    const [copy] = leaving();
    expect(leaving()).toHaveLength(1);
    expect(copy.style.getPropertyValue('--side')).toBe('-1');
    expect(copy.style.getPropertyValue('--distance')).toBe('2');
    expect(copy.style.getPropertyValue('--card-opacity')).toBe('0');
    expect(copy.hasAttribute('data-game-index')).toBe(false);
    expect(copy.getAttribute('aria-hidden')).toBe('true');
    vi.advanceTimersByTime(550);
    expect(leaving()).toHaveLength(0);
  });

  it('leaves no copy when the visitor asks for less motion', async () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true });
    await bootWithGames(['alpha']);
    click(byId('next'));
    expect(leaving()).toHaveLength(0);
  });
});
