import { useEffect, useRef } from 'react';
import { useArcade } from '../arcade/arcade-context';
import { playConfetti } from './confetti-view.js';

// The paper bursts from the thanks step's heart, and stops when the supporter leaves the step.
export function useConfetti() {
  const { window } = useArcade();
  const stop = useRef(() => {});

  useEffect(() => () => stop.current(), []);

  return {
    play() {
      const { document } = window;

      stop.current();
      stop.current = playConfetti({
        document,
        canvas: document.getElementById('donate-confetti'),
        from: document.querySelector('#donate-thanks .heart-badge'),
      });
    },

    stop: () => stop.current(),
  };
}
