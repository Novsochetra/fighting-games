// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { openPage } from '../../support/open-page.js';

// The paid bill is copied and thrown off the pad. The copy took every class of the bill it was
// copied from, the stamp's jolt among them, whose animation outranked the throw: the copy stood
// over the new bill until it was removed, and the paid bill seemed to blink out.
describe('a paid bill torn off the pad', () => {
  it('carries only its own motion, and its stamp', () => {
    const page = openPage();

    page.deal(1000);
    page.give();
    page.wait(260);

    const torn = document.querySelector('.slip-torn');

    expect(torn.className).toBe('slip slip-torn');
    expect(torn.querySelector('.blank').classList.contains('is-paid')).toBe(true);
    expect(torn.querySelector('[id]')).toBeNull();
  });

  it('is the bill that was paid, not the one written after it', () => {
    const page = openPage();

    page.deal(1000);
    page.give();
    page.wait(260);

    expect(document.querySelector('.slip-torn .serial').textContent).toBe('No 0001');
    expect(page.text('serial')).toBe('No 0002');
  });
});
