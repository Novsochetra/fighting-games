import { describe, expect, it } from 'vitest';
import { PAY_WAIT_SECONDS, sentLabel } from '@/screens/supporters/donate/pay-wait.js';

describe('the wait on I sent it', () => {
  it('lasts ten seconds', () => {
    expect(PAY_WAIT_SECONDS).toBe(10);
  });

  it('shows the seconds left, then none once they are out', () => {
    expect(sentLabel(3)).toBe('I sent it (3)');
    expect(sentLabel(2)).toBe('I sent it (2)');
    expect(sentLabel(0)).toBe('I sent it');
  });
});
