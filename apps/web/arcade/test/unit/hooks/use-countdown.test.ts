// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCountdown } from '@/hooks/use-countdown';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useCountdown', () => {
  it('counts down each second, then lets go of its timer', () => {
    const { result } = renderHook(() => useCountdown(3));

    act(() => result.current.start());
    expect(result.current.left).toBe(3);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.left).toBe(2);

    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.left).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops at once', () => {
    const { result } = renderHook(() => useCountdown(10));

    act(() => result.current.start());
    act(() => result.current.stop());

    expect(result.current.left).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('starts from the seconds it is given', () => {
    const { result } = renderHook(() => useCountdown(10));

    act(() => result.current.start());

    expect(result.current.left).toBe(10);
  });
});
