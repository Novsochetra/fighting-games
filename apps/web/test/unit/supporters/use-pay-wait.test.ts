// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PAY_WAIT_SECONDS, sentLabel } from '../../../src/supporters/pay-wait.js';
import { usePayWait } from '../../../src/supporters/use-pay-wait';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('usePayWait', () => {
  it('counts down each second, then lets I sent it go', () => {
    const { result } = renderHook(() => usePayWait(3));

    act(() => result.current.start());
    expect(sentLabel(result.current.left)).toBe('I sent it (3)');

    act(() => vi.advanceTimersByTime(1000));
    expect(sentLabel(result.current.left)).toBe('I sent it (2)');

    act(() => vi.advanceTimersByTime(2000));
    expect(sentLabel(result.current.left)).toBe('I sent it');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops at once when the supporter leaves the code', () => {
    const { result } = renderHook(() => usePayWait());

    act(() => result.current.start());
    act(() => result.current.stop());

    expect(result.current.left).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('waits ten seconds by default', () => {
    const { result } = renderHook(() => usePayWait());

    act(() => result.current.start());

    expect(PAY_WAIT_SECONDS).toBe(10);
    expect(result.current.left).toBe(10);
  });
});
