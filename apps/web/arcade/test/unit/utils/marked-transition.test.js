import { describe, expect, it, vi } from 'vitest';
import { startMarkedTransition } from '@/utils/marked-transition.js';

function fakeDocument() {
  const transitions = [];
  const document = {
    documentElement: { dataset: {} },
    startViewTransition: vi.fn((update) => {
      let finish;
      const finished = new Promise((resolve) => {
        finish = resolve;
      });

      update();
      transitions.push({ finish });

      return { finished, updateCallbackDone: Promise.resolve() };
    }),
  };

  return { document, transitions };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('startMarkedTransition', () => {
  it('marks the root with its kind while it plays, then takes the mark off', async () => {
    const { document, transitions } = fakeDocument();
    const update = vi.fn();

    startMarkedTransition(document, 'push', update);

    expect(update).toHaveBeenCalledOnce();
    expect(document.documentElement.dataset.transition).toBe('push');

    transitions[0].finish();
    await flush();

    expect(document.documentElement.dataset.transition).toBeUndefined();
  });

  it('leaves the mark of a transition that started over it', async () => {
    const { document, transitions } = fakeDocument();

    startMarkedTransition(document, 'appearance', () => {});
    startMarkedTransition(document, 'pop', () => {});
    transitions[0].finish();
    await flush();

    expect(document.documentElement.dataset.transition).toBe('pop');
  });

  it('makes the change at once where there are no view transitions', () => {
    const document = { documentElement: { dataset: {} } };
    const update = vi.fn();

    expect(startMarkedTransition(document, 'push', update)).toBeNull();
    expect(update).toHaveBeenCalledOnce();
    expect(document.documentElement.dataset.transition).toBeUndefined();
  });
});
