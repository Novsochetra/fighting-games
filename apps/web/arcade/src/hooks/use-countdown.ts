import { useEffect, useState } from 'react';

export function useCountdown(seconds: number) {
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
