// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  bootPage,
  byId,
  jsonReply,
  loadSupportersMarkup,
  samplePayload,
  stopPages,
} from '../../support/supporters-harness.js';

// Bug: as the supporters came in, the stats appeared above Become a supporter in one frame and
// pushed it 60px down, the spinner blinked out and the sections popped in. The page now swaps
// through layout-swap.js: the button glides down while the spinner fades where it stood, then the
// stats and the sections rise in.
const TOKENS = {
  '--duration-rise': '500ms',
  '--duration-normal': '200ms',
  '--duration-stagger': '60ms',
  '--easing-spring': 'spring',
  '--easing-standard': 'standard',
  '--offset-rise': '12px',
};

const rectAt = (top) => ({ top, left: 16, width: 160, height: 44 });

beforeEach(async () => {
  document.body.innerHTML = '';
  await loadSupportersMarkup();

  for (const [name, value] of Object.entries(TOKENS)) {
    document.documentElement.style.setProperty(name, value);
  }

  // happy-dom lays nothing out, so the button sits where the page would put it
  vi.spyOn(byId('donate'), 'getBoundingClientRect').mockImplementation(() =>
    rectAt(byId('stats').hidden ? 184 : 244),
  );
});

afterEach(() => {
  stopPages();
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('style');
});

describe('the supporters arriving', () => {
  it('glide Become a supporter down to its place, then bring the stats in', async () => {
    const glide = vi.spyOn(byId('donate'), 'animate');
    const rise = vi.spyOn(byId('stats'), 'animate');

    await bootPage(async () => jsonReply(samplePayload()));

    expect(byId('stats').hidden).toBe(false);
    expect(glide).toHaveBeenCalledWith(
      [{ translate: '0px -60px' }, { translate: '0 0' }],
      expect.objectContaining({ duration: 500 }),
    );
    expect(rise.mock.calls[0][0][0]).toMatchObject({ opacity: 0 });
    expect(rise.mock.calls[0][1]).toMatchObject({ delay: 200, fill: 'backwards' });
  });

  it('fade the spinner out where it stood rather than blink it away', async () => {
    await bootPage(async () => jsonReply(samplePayload()));
    const copy = byId('notice').previousElementSibling;

    expect(byId('notice').hidden).toBe(true);
    expect(copy?.classList.contains('notice')).toBe(true);
    expect(copy.textContent).toContain('Loading supporters…');
    expect(copy.getAnimations()).toHaveLength(1);
  });
});
