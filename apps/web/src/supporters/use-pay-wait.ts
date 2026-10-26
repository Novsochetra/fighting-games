import { useEffect, useState } from 'react';
import { PAY_WAIT_SECONDS } from './pay-wait.js';

// I sent it counts down from when the code shows (pay-wait.js).
export function usePayWait(seconds = PAY_WAIT_SECONDS) {
  const [left, setLeft] = useState(0);
  const waiting = left > 0;

  useEffect(() => {
    if (!waiting) {
      return undefined;
    }

    const tick = setInterval(() => setLeft((was) => Math.max(0, was - 1)), 1000);

    return () => clearInterval(tick);
  }, [waiting]);

  return { left, start: () => setLeft(seconds), stop: () => setLeft(0) };
}
