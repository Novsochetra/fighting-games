import { describe, expect, it, vi } from 'vitest';
import { settleEntrances } from '../../../src/arcade/arrive-drawn';

const animation = (animationName?: string) => ({ animationName, finish: vi.fn() });

function rootWith(animations: ReturnType<typeof animation>[]) {
  const getAnimations = vi.fn(() => animations);

  return { root: { getAnimations } as unknown as Element, getAnimations };
}

describe('settleEntrances', () => {
  it('ends the named CSS animations under the root, and only those', () => {
    const rise = animation('place-rise');
    const spin = animation('spin');
    const glide = animation();
    const { root, getAnimations } = rootWith([rise, spin, glide]);

    settleEntrances(root, ['place-rise', 'row-rise']);

    expect(getAnimations).toHaveBeenCalledWith({ subtree: true });
    expect(rise.finish).toHaveBeenCalledOnce();
    expect(spin.finish).not.toHaveBeenCalled();
    expect(glide.finish).not.toHaveBeenCalled();
  });

  it('does nothing where the browser lists no animations', () => {
    expect(() => settleEntrances({} as Element, ['place-rise'])).not.toThrow();
  });
});
