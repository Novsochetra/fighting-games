import { animateWith, readTiming, readToken } from '@/styles/motion-tokens.js';

// A swipe that lands mid-rise carries on from how far the text has risen; starting over from
// nothing made quick swipes blink.
export function riseText(element, previous) {
  const document = element.ownerDocument;
  const isRising = previous?.playState === 'running';
  const shown = isRising ? Number(document.defaultView.getComputedStyle(element).opacity) : 0;

  previous?.cancel();
  const offset = Number.parseFloat(readToken(document, '--offset-rise')) || 0;
  const timing = readTiming(document, { duration: '--duration-rise', easing: '--easing-spring' });

  return animateWith(
    element,
    [
      { opacity: shown, transform: `translateY(${offset * (1 - shown)}px)` },
      { opacity: 1, transform: 'none' },
    ],
    timing,
  );
}

// The heart pops only when it is tapped, never when a swipe brings back a game kept as a favorite.
export function popHeart(heart) {
  const document = heart.ownerDocument;
  const scale = readToken(document, '--scale-heart-pop') || '1';
  const timing = readTiming(document, { duration: '--duration-ring', easing: '--easing-pop' });

  animateWith(heart, [{ scale: '1' }, { scale, offset: 0.4 }, { scale: '1' }], timing);
}
