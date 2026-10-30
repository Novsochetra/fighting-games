// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  bootPage,
  byId,
  jsonReply,
  samplePayload,
  stopPages,
} from '../../support/supporters-harness.js';

// Bug: as the supporters came in, the stats appeared above Become a supporter in one frame and
// pushed it 60px down, the spinner blinked out and the sections popped in. The screen now swaps
// through layout-swap.js (LayoutSwap): the button glides down while the spinner fades where it
// stood, then the stats and the sections rise in.
const TOKENS = {
  '--duration-rise': '500ms',
  '--duration-normal': '200ms',
  '--duration-stagger': '60ms',
  '--easing-spring': 'spring',
  '--easing-standard': 'standard',
  '--offset-rise': '12px',
};

const rectAt = (top) => ({ top, left: 16, width: 160, height: 44 });

// happy-dom lays nothing out, so the button sits where the page would put it
const layOut = () =>
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function placed() {
    return this.id === 'donate' ? rectAt(byId('stats').hidden ? 184 : 244) : rectAt(0);
  });

beforeEach(() => {
  for (const [name, value] of Object.entries(TOKENS)) {
    document.documentElement.style.setProperty(name, value);
  }

  layOut();
});

afterEach(() => {
  stopPages();
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('style');
});

describe('the supporters arriving', () => {
  it('glide Become a supporter down to its place, then bring the stats in', async () => {
    const animate = vi.spyOn(HTMLElement.prototype, 'animate');
    const callsOn = (id) =>
      animate.mock.contexts.flatMap((element, i) =>
        element.id === id ? [animate.mock.calls[i]] : [],
      );

    await bootPage(async () => jsonReply(samplePayload()));
    const [glide] = callsOn('donate');
    const [rise] = callsOn('stats');

    expect(byId('stats').hidden).toBe(false);
    expect(glide).toEqual([
      [{ translate: '0px -60px' }, { translate: '0 0' }],
      expect.objectContaining({ duration: 500 }),
    ]);
    expect(rise[0][0]).toMatchObject({ opacity: 0 });
    expect(rise[1]).toMatchObject({ delay: 200, fill: 'backwards' });
  });

  it('fade the spinner out where it stood rather than blink it away', async () => {
    await bootPage(async () => jsonReply(samplePayload()));
    const copy = byId('supporters-notice').previousElementSibling;

    expect(byId('supporters-notice').hidden).toBe(true);
    expect(copy?.classList.contains('notice')).toBe(true);
    expect(copy.textContent).toContain('Loading supporters…');
    expect(copy.getAnimations()).toHaveLength(1);
  });
});
