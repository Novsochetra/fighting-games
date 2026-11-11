import { animateWith, readTiming, readToken } from '@/styles/motion-tokens.js';

const offsetOf = (document, name) => Number.parseFloat(readToken(document, name)) || 0;

// The heart pops as it fills, as the home's favorite does, and only at the tap: a sheet opened on
// a wallpaper liked before shows it full and still.
export function popLikeHeart(heart) {
  const document = heart.ownerDocument;
  const scale = readToken(document, '--scale-heart-pop') || '1';
  const timing = readTiming(document, { duration: '--duration-ring', easing: '--easing-pop' });

  animateWith(heart, [{ scale: '1' }, { scale, offset: 0.4 }, { scale: '1' }], timing);
}

// Little hearts fly out from the big one all round, upright, each shrinking as it fades.
export function burstSparks(sparks) {
  const [first] = sparks;

  if (!first) {
    return;
  }

  const document = first.ownerDocument;
  const distance = offsetOf(document, '--offset-like-spark');
  const timing = readTiming(document, {
    duration: '--duration-like-burst',
    easing: '--easing-standard',
  });

  sparks.forEach((spark, index) => {
    const angle = (2 * Math.PI * index) / sparks.length;
    const x = Math.sin(angle) * distance;
    const y = -Math.cos(angle) * distance;

    animateWith(
      spark,
      [
        { opacity: 1, transform: 'translate(0, 0) scale(0.3)' },
        { opacity: 1, transform: `translate(${x * 0.7}px, ${y * 0.7}px) scale(1)`, offset: 0.5 },
        { opacity: 0, transform: `translate(${x}px, ${y}px) scale(0.6)` },
      ],
      timing,
    );
  });
}

// A big heart pops up over the picture with a little overshoot, holds a moment, then floats up as
// it fades. Each step has its own curve, so the whole runs at an even pace.
export function floatBigHeart(heart) {
  const document = heart.ownerDocument;
  const rise = offsetOf(document, '--offset-like-float');
  const pop = readToken(document, '--easing-pop') || 'ease-out';
  const settle = readToken(document, '--easing-standard') || 'ease';
  const { duration } = readTiming(document, {
    duration: '--duration-like-float',
    easing: '--easing-standard',
  });

  animateWith(
    heart,
    [
      { opacity: 0, transform: 'translateY(0) scale(0.3)', easing: pop },
      { opacity: 1, transform: 'translateY(0) scale(1)', offset: 0.3, easing: 'linear' },
      { opacity: 1, transform: 'translateY(0) scale(1)', offset: 0.55, easing: settle },
      { opacity: 0, transform: `translateY(${-rise}px) scale(1.05)` },
    ],
    { duration, easing: 'linear' },
  );
}

// The count rolls in the way it went: up from below for a like, down from above for taking it back.
export function rollCount(count, direction) {
  const document = count.ownerDocument;
  const from = direction === 'up' ? '60%' : '-60%';
  const timing = readTiming(document, {
    duration: '--duration-segment',
    easing: '--easing-spring',
  });

  animateWith(
    count,
    [
      { opacity: 0, transform: `translateY(${from})` },
      { opacity: 1, transform: 'none' },
    ],
    timing,
  );
}
