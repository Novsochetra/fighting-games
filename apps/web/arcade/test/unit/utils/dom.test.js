import { describe, expect, it } from 'vitest';
import { handlesEnter, isPlainClick, isTextField } from '@/utils/dom.js';

describe('isTextField and handlesEnter', () => {
  it('spots fields, where every key is typing', () => {
    expect(isTextField({ tagName: 'INPUT' })).toBe(true);
    expect(isTextField({ tagName: 'TEXTAREA' })).toBe(true);
    expect(isTextField({ tagName: 'BUTTON' })).toBe(false);
    expect(isTextField(null)).toBe(false);
  });

  it('spots links and buttons, which answer Enter and Space themselves', () => {
    expect(handlesEnter({ tagName: 'A' })).toBe(true);
    expect(handlesEnter({ tagName: 'BUTTON' })).toBe(true);
    expect(handlesEnter({ tagName: 'BODY' })).toBe(false);
    expect(handlesEnter(undefined)).toBe(false);
  });
});

describe('isPlainClick', () => {
  const click = (overrides = {}) => ({ button: 0, ...overrides });

  it('takes a plain primary click', () => {
    expect(isPlainClick(click())).toBe(true);
  });

  it.each([
    { button: 1 },
    { metaKey: true },
    { ctrlKey: true },
    { shiftKey: true },
    { altKey: true },
  ])('leaves %j to the browser, which opens a tab or window', (overrides) => {
    expect(isPlainClick(click(overrides))).toBe(false);
  });
});
