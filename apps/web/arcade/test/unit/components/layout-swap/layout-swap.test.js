// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  enterDelay,
  planSwap,
  playSwap,
  snapshotSwap,
  stopSwap,
} from '@/components/layout-swap/layout-swap.js';

// A swap as a screen makes one (LayoutSwap.tsx): where the blocks show, the change, then the moves.
function swapOf(elements) {
  const running = [];

  return (update) => {
    const snapshot = snapshotSwap(elements);

    stopSwap(running);
    update();

    if (snapshot) {
      running.push(...playSwap(elements, snapshot));
    }
  };
}

const TOKENS = {
  '--duration-rise': '500ms',
  '--duration-normal': '200ms',
  '--duration-stagger': '60ms',
  '--easing-spring': 'spring',
  '--easing-standard': 'standard',
  '--offset-rise': '12px',
};

const at = (top, left = 0) => ({ top, left, width: 120, height: 40 });
const shownAt = (top, left) => ({ shown: true, rect: at(top, left), opacity: 1 });
const unseen = { shown: false, rect: null, opacity: 0 };

describe('planSwap', () => {
  it('glides what moved from its old place and keeps what stayed', () => {
    const plan = planSwap([shownAt(184), shownAt(40, 10)], [shownAt(244), shownAt(40.3, 10)]);

    expect(plan).toEqual([{ kind: 'move', dx: 0, dy: -60 }, { kind: 'stay' }]);
  });

  it('brings in what came, fades out what went, and leaves alone what never showed', () => {
    const faded = { shown: true, rect: at(0), opacity: 0 };
    const plan = planSwap(
      [unseen, shownAt(200), faded, unseen],
      [shownAt(260), unseen, unseen, unseen],
    );

    expect(plan.map((step) => step.kind)).toEqual(['enter', 'leave', 'none', 'none']);
  });
});

describe('enterDelay', () => {
  const leave = { duration: 200 };

  it('holds what comes in while the rest makes room', () => {
    expect(enterDelay([{ kind: 'move', dx: 0, dy: 60 }, { kind: 'enter' }], { leave })).toBe(200);
    expect(enterDelay([{ kind: 'leave' }, { kind: 'enter' }], { leave })).toBe(200);
  });

  it('brings it in at once into an empty space', () => {
    expect(enterDelay([{ kind: 'stay' }, { kind: 'enter' }], { leave })).toBe(0);
  });
});

function setUpPage() {
  document.body.innerHTML = `
    <main>
      <div id="notice"><p id="status" role="status">Loading…</p></div>
      <button id="donate" type="button">Become a supporter</button>
      <dl id="stats" hidden></dl>
    </main>`;
  const byId = (id) => document.getElementById(id);
  const [notice, donate, stats] = ['notice', 'donate', 'stats'].map(byId);

  vi.spyOn(donate, 'getBoundingClientRect').mockImplementation(() => at(stats.hidden ? 184 : 244));
  vi.spyOn(notice, 'getBoundingClientRect').mockImplementation(() => at(300));

  const show = () => {
    notice.hidden = true;
    stats.hidden = false;
  };

  return { notice, donate, stats, show, swap: swapOf([notice, donate, stats]) };
}

describe('a layout swap', () => {
  beforeEach(() => {
    for (const [name, value] of Object.entries(TOKENS)) {
      document.documentElement.style.setProperty(name, value);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('style');
  });

  it('glides what moved, and brings in what came once there is room', () => {
    const { donate, stats, show, swap } = setUpPage();
    const glide = vi.spyOn(donate, 'animate');
    const rise = vi.spyOn(stats, 'animate');

    swap(show);

    expect(glide).toHaveBeenCalledWith([{ translate: '0px -60px' }, { translate: '0 0' }], {
      duration: 500,
      easing: 'spring',
    });
    expect(rise).toHaveBeenCalledWith(
      [
        { opacity: 0, translate: '0 12px' },
        { opacity: 1, translate: '0 0' },
      ],
      { duration: 500, easing: 'spring', delay: 200, fill: 'backwards' },
    );
  });

  it('fades out a copy where the notice stood, never found, reached or announced, then drops it', async () => {
    const { notice, show, swap } = setUpPage();

    swap(show);
    const copy = notice.previousElementSibling;

    expect(notice.hidden).toBe(true);
    expect(copy.className).toBe(notice.className);
    expect(copy.hidden).toBe(false);
    expect(copy.querySelector('[id]')).toBeNull();
    expect(copy.hasAttribute('id')).toBe(false);
    expect(copy.hasAttribute('inert')).toBe(true);
    expect(copy.getAttribute('aria-hidden')).toBe('true');
    expect(copy.style.position).toBe('absolute');
    expect(document.querySelectorAll('#notice, #status')).toHaveLength(2);

    await vi.waitFor(() => expect(copy.isConnected).toBe(false));
  });

  it('starts a swap that lands mid-glide from where things are, and stops the last one', () => {
    const { notice, stats, show, swap } = setUpPage();

    swap(show);
    const [first] = stats.getAnimations();
    const cancel = vi.spyOn(first, 'cancel');

    swap(() => {
      notice.hidden = false;
      stats.hidden = true;
    });

    expect(cancel).toHaveBeenCalled();
  });

  it('changes at once with reduced motion, or without the motion tokens', () => {
    for (const reduceMotion of [true, false]) {
      vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: reduceMotion });
      if (!reduceMotion) {
        document.documentElement.removeAttribute('style');
      }

      const { notice, donate, stats, show, swap } = setUpPage();
      const animations = [notice, donate, stats].map((element) => vi.spyOn(element, 'animate'));

      swap(show);

      expect(stats.hidden).toBe(false);
      expect(notice.previousElementSibling).toBeNull();
      animations.forEach((animate) => expect(animate).not.toHaveBeenCalled());
    }
  });
});
